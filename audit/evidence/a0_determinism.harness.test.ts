import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { describe, it } from "vitest";
import { DEFAULT_CONFIG, InsightStory, SnapshotSlot } from "../../src/insight/src/types/index.ts";
import { runInsightPipeline } from "../../src/insight/src/pipeline/pipeline.ts";
import {
  computeTrustScore, getSourceContentDomain, getSourceDistributionType, getSourceTier,
} from "../../src/insight/src/pipeline/normalize.ts";
import { invalidateSlot } from "../../src/insight/src/cache/cacheManager.ts";
import { getEmbeddings } from "../../src/adapters/embeddingsAdapter.js";

const SNAPSHOT_PATH = path.resolve("public/newsdata/insight_2026-05-19.json");
const OUT_PATH = path.resolve("audit/evidence/A0-run-projection.json");
const SLOT_ORDER: SnapshotSlot[] = ["now", "minus4h", "minus12h", "minus24h", "minus36h", "minus48h"];
const N = 10;

function normalizeSlot(slot: string): SnapshotSlot {
  return (SLOT_ORDER.includes(slot as SnapshotSlot) ? slot : "now") as SnapshotSlot;
}
function getStorySlot(story: any, snapshot: any): SnapshotSlot {
  const explicit = story?.capturedAtSnapshot || story?._snapshotIntake?.selectedFromSlot;
  if (explicit) return normalizeSlot(String(explicit));
  const slotMeta = snapshot?.slotMeta || {};
  for (const slot of SLOT_ORDER) {
    const ids = Array.isArray(slotMeta?.[slot]?.storyIds) ? slotMeta[slot].storyIds : [];
    if (ids.includes(story?.id)) return slot;
  }
  return "now";
}
function toInsightStory(raw: any, index: number, slot: SnapshotSlot, embedding: number[]): InsightStory {
  const title = String(raw?.title || raw?.headline || "Untitled");
  const summary = String(raw?.summary || raw?.description || raw?.content || "");
  const source = String(raw?.source || raw?.sourceGroup || "Unknown source");
  const sourceGroup = (String(raw?.sourceGroup || raw?.source || "unknown_source")
    .toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")) || "unknown_source";
  const sourceTier = raw?.sourceTier || getSourceTier(sourceGroup);
  const sourceDistributionType = getSourceDistributionType(sourceGroup);
  const sourceContentDomain = getSourceContentDomain(sourceGroup, raw?.category);
  const topicTokens = Array.isArray(raw?.storySignals?.topicTokens) ? raw.storySignals.topicTokens : [];
  const numbers = Array.isArray(raw?.storySignals?.numbers) ? raw.storySignals.numbers
    : Array.isArray(raw?.numbers) ? raw.numbers : [];
  const keywords = Array.from(new Set([
    ...topicTokens, ...(Array.isArray(raw?.keywords) ? raw.keywords : []),
    ...title.toLowerCase().split(/\W+/).filter((t: string) => t.length >= 4).slice(0, 8),
  ])).slice(0, 16);
  return {
    ...raw,
    id: String(raw?.id || raw?.url || `real-snapshot-${index}`),
    title, summary, source, sourceGroup,
    url: String(raw?.url || raw?.link || `snapshot://real/${index}`),
    publishedAt: Number(raw?.publishedAt || Date.now()),
    category: String(raw?.category || "news"),
    region: String(raw?.region || "India"),
    language: String(raw?.language || "en"),
    capturedAtSnapshot: slot,
    canonicalUrl: String(raw?.canonicalUrl || raw?.url || raw?.link || `snapshot://real/${index}`),
    canonicalText: String(raw?.canonicalText || `${title} ${summary}`),
    canonicalTextHash: String(raw?.canonicalTextHash || raw?.contentHash || `real-hash-${index}`),
    entities: {
      people: raw?.entities?.people ?? [], orgs: raw?.entities?.orgs ?? [],
      places: raw?.entities?.places ?? [], products: raw?.entities?.products ?? [],
      symbols: raw?.entities?.symbols ?? [],
    },
    keywords, embedding,
    eventVerbs: Array.isArray(raw?.eventVerbs) ? raw.eventVerbs : [],
    numbers, sourceTier, sourceDistributionType, sourceContentDomain,
    sectionDomain: raw?.category ? getSourceContentDomain(sourceGroup, raw.category) : undefined,
    correctionMarker: /\b(corrects|correction|update|clarification|retraction)\b/i.test(title),
    trustScore: computeTrustScore(sourceTier, sourceDistributionType),
    sourceAuthority: Number(raw?.sourceAuthority || 0.7),
    freshnessScore: Number(raw?.freshnessScore || 0.75),
    rawProminence: Number(raw?.rawProminence || 0.65),
    sentiment: Number(raw?.sentiment || 0),
    factualDensity: Number(raw?.factualDensity || 0.7),
    summaryQuality: Number(raw?.summaryQuality || 0.75),
  } as InsightStory;
}
async function makeFetcher(snapshot: any) {
  const stories = Array.isArray(snapshot?.stories) ? snapshot.stories : [];
  const texts = stories.map((s: any) =>
    `${String(s?.title || s?.headline || "Untitled")} ${String(s?.summary || s?.description || s?.content || "")}`);
  const embeddings = await getEmbeddings(texts);
  const normalized = stories.map((s: any, i: number) => toInsightStory(s, i, getStorySlot(s, snapshot), embeddings[i] || []));
  return async (slot: SnapshotSlot): Promise<InsightStory[]> => normalized.filter(s => s.capturedAtSnapshot === slot);
}
function clearCache() { for (const s of SLOT_ORDER) invalidateSlot(s); }

// Canonical projection of the A0 exit-gate outputs.
function project(parents: any[]) {
  return parents.map(p => ({
    parentId: p.parentId,
    finalParentScore: p.finalParentScore,
    clusterStoryIds: p.clusterStoryIds,
    childStoryIds: p.childStoryIds,
    hiddenDuplicateIds: p.hiddenDuplicateIds,
    weakTree: p.weakTree,
    scores: {
      impact: p.impactScore, persistence: p.persistenceScore, novelty: p.noveltyScore,
      freshness: p.freshnessScore, momentum: p.crossSnapshotMomentum,
      region: p.regionBoost, evolution: p.evolutionDiversityScore,
      infoDelta: p.informationDeltaScore, wire: p.wirePenaltyScore,
    },
  }));
}
const sha = (v: unknown) => crypto.createHash("sha256").update(JSON.stringify(v)).digest("hex").slice(0, 16);

async function runOnce(snapshot: any) {
  clearCache();
  const result = await runInsightPipeline(await makeFetcher(snapshot), DEFAULT_CONFIG);
  return project(result.parents);
}

describe("A0 determinism harness (frozen snapshot insight_2026-05-19.json)", () => {
  it(`N=${N} runs, real clock vs frozen clock`, async () => {
    const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"));

    // ── Variant 1: REAL clock (Date.now() advances) ──
    const realHashes: string[] = [];
    let firstProjection: any = null;
    for (let i = 0; i < N; i++) {
      const proj = await runOnce(snapshot);
      if (i === 0) firstProjection = proj;
      realHashes.push(sha(proj));
    }

    // ── Variant 2: FROZEN clock (virtual clock simulated by pinning Date.now) ──
    const FIXED = 1747645200000; // 2026-05-19T13:00:00Z
    const realDateNow = Date.now;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Date as any).now = () => FIXED;
    const frozenHashes: string[] = [];
    try {
      for (let i = 0; i < N; i++) frozenHashes.push(sha(await runOnce(snapshot)));
    } finally {
      (Date as any).now = realDateNow;
    }

    const uniqReal = [...new Set(realHashes)];
    const uniqFrozen = [...new Set(frozenHashes)];

    const out = {
      snapshot: "public/newsdata/insight_2026-05-19.json",
      contentHash: "40f989d5da9c",
      node: process.version,
      N,
      parentCount: firstProjection.length,
      realClock: { hashes: realHashes, uniqueCount: uniqReal.length, identical: uniqReal.length === 1 },
      frozenClock: { fixedEpochMs: FIXED, hashes: frozenHashes, uniqueCount: uniqFrozen.length, identical: uniqFrozen.length === 1 },
    };
    fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
    console.log("[A0]", JSON.stringify({
      parentCount: out.parentCount,
      realClock_identical: out.realClock.identical, realClock_uniqueHashes: uniqReal.length,
      frozenClock_identical: out.frozenClock.identical, frozenClock_uniqueHashes: uniqFrozen.length,
    }, null, 2));
  }, 120000);
});
