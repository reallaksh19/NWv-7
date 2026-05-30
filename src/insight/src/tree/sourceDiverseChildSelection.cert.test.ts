import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONFIG,
  InsightConfig,
  InsightParent,
  InsightStory,
} from "../types";
import {
  enforceSourceDiverseChildSelection,
} from "./sourceDiverseChildSelection";

const NOW = Date.parse("2026-01-01T08:00:00Z");

function vector(seed: number): number[] {
  const values = Array.from({ length: 200 }, () => 0);
  values[seed % 200] = 1;
  values[(seed + 19) % 200] = 0.4;
  return values;
}

function story(
  id: string,
  angle: any,
  sourceGroup: string,
  seed: number,
  tier: any = "A",
  authority = 0.82
): InsightStory {
  return {
    id,
    title: id,
    summary: "A useful story with distinct source perspective.",
    source: sourceGroup,
    sourceGroup,
    url: "https://example.test/" + id,
    publishedAt: NOW,
    category: "news",
    region: "India",
    language: "en",
    capturedAtSnapshot: "now",
    canonicalUrl: "https://example.test/" + id,
    canonicalText: id,
    canonicalTextHash: "hash-" + id,
    entities: {
      people: [],
      orgs: ["Acme Bank"],
      places: ["India"],
      products: [],
      symbols: [],
    },
    keywords: ["acme", "bank"],
    embedding: vector(seed),
    eventVerbs: ["announces"],
    numbers: [],
    sourceTier: tier,
    sourceAuthority: authority,
    freshnessScore: 0.84,
    rawProminence: 0.76,
    sentiment: 0,
    factualDensity: 0.72,
    summaryQuality: 0.82,
    angle,
  };
}

function parent(ids: string[]): InsightParent {
  return {
    parentId: "p1",
    canonicalHeadline: "Acme Bank outage",
    canonicalSummary: "Acme Bank outage summary",
    clusterStoryIds: ids,
    childStoryIds: ids.slice(0, 2),
    hiddenDuplicateIds: [],
    keyEntities: ["Acme Bank"],
    keyPlaces: ["India"],
    keyVerbs: ["announces"],
    keyNumbers: [],
    firstSeenAt: NOW,
    latestSeenAt: NOW,
    snapshotPresence: {
      now: true,
      minus4h: false,
      minus12h: false,
      minus24h: false,
    },
    impactScore: 0.8,
    persistenceScore: 0.8,
    sourceDiversityScore: 0.8,
    noveltyScore: 0.8,
    freshnessScore: 0.8,
    crossSnapshotMomentum: 0.8,
    editorialClarityScore: 0.8,
    regionBoost: 0,
    finalParentScore: 0.8,
    isRising: false,
    weakTree: false,
    debug: {
      clusterSize: ids.length,
      hiddenCount: 0,
      matchedSnapshots: ["now"],
      scoreBreakdown: {},
      replacements: [],
    },
  };
}

const cfg: InsightConfig = {
  ...DEFAULT_CONFIG,
  MAX_CHILDREN_PER_PARENT: 4,
  MAX_PER_SOURCE_GROUP: 2,
  MIN_SOURCES_PER_TREE: 3,
  TIER_D_EXCLUDE: true,
};

function sourceSet(stories: InsightStory[]): Set<string> {
  return new Set(stories.map(story => story.sourceGroup));
}

function angleSet(stories: InsightStory[]): Set<string | undefined> {
  return new Set(stories.map(story => story.angle));
}

describe("Insight source-diverse child selection certification", () => {
  it("adds a missing source group when selection is source-concentrated", () => {
    const cluster = [
      story("wire-1", "base_report", "wire", 1),
      story("wire-2", "official_response", "wire", 2),
      story("local-1", "regional_followup", "local", 3),
      story("analysis-1", "expert_analysis", "analysis", 4),
    ];

    const selected = [cluster[0], cluster[1]];
    const hiddenIds = new Set(["local-1", "analysis-1"]);
    const p = parent(cluster.map(item => item.id));

    const result = enforceSourceDiverseChildSelection(p, selected, cluster, cfg, hiddenIds);

    expect(sourceSet(result).size).toBeGreaterThanOrEqual(2);
    expect(result.map(item => item.id)).toContain("local-1");
    expect(hiddenIds.has("local-1")).toBe(false);
    expect((p.debug as any).sourceDiverseSelectionDiagnostics.recoveredCount).toBeGreaterThanOrEqual(1);
  });

  it("replaces same-source-heavy child when selection is full", () => {
    const localCfg: InsightConfig = {
      ...cfg,
      MAX_CHILDREN_PER_PARENT: 2,
      MIN_SOURCES_PER_TREE: 2,
    };

    const cluster = [
      story("wire-1", "base_report", "wire", 1),
      story("wire-2", "official_response", "wire", 2),
      story("local-1", "regional_followup", "local", 3),
    ];

    const selected = [cluster[0], cluster[1]];
    const hiddenIds = new Set(["local-1"]);
    const p = parent(cluster.map(item => item.id));

    const result = enforceSourceDiverseChildSelection(p, selected, cluster, localCfg, hiddenIds);

    expect(result).toHaveLength(2);
    expect(sourceSet(result).size).toBe(2);
    expect(result.map(item => item.id)).toContain("local-1");
    expect((p.debug as any).sourceDiverseSelectionDiagnostics.replacedCount).toBe(1);
    expect(p.debug.replacements[0].replacedBy).toBe("local-1");
  });

  it("does not reduce existing angle diversity below two angles", () => {
    const localCfg: InsightConfig = {
      ...cfg,
      MAX_CHILDREN_PER_PARENT: 2,
      MIN_SOURCES_PER_TREE: 2,
    };

    const cluster = [
      story("wire-base", "base_report", "wire", 1),
      story("wire-official", "official_response", "wire", 2),
      story("local-base", "base_report", "local", 3),
    ];

    const selected = [cluster[0], cluster[1]];
    const p = parent(cluster.map(item => item.id));

    const result = enforceSourceDiverseChildSelection(
      p,
      selected,
      cluster,
      localCfg,
      new Set(["local-base"])
    );

    expect(angleSet(result).size).toBeGreaterThanOrEqual(2);
  });

  it("rejects tier D source candidates", () => {
    const cluster = [
      story("wire-1", "base_report", "wire", 1),
      story("wire-2", "official_response", "wire", 2),
      story("bad-source", "regional_followup", "weak", 3, "D", 0.2),
    ];

    const selected = [cluster[0], cluster[1]];
    const p = parent(cluster.map(item => item.id));

    const result = enforceSourceDiverseChildSelection(p, selected, cluster, cfg, new Set());

    expect(result.map(item => item.id)).not.toContain("bad-source");
    expect((p.debug as any).sourceDiverseSelectionDiagnostics.rejectedCount).toBeGreaterThanOrEqual(1);
  });
});
