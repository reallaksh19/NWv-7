// ─────────────────────────────────────────────
//  INSIGHT TAB — Deduplication (3 Layers)
// ─────────────────────────────────────────────

import { InsightStory, InsightConfig, AngleLabel } from "../types";

// ── Duplicate diagnostics ─────────────────────────────────────────────────────

export type DuplicateDecisionReason =
  | "CANONICAL_URL_DUPLICATE"
  | "CANONICAL_TEXT_HASH_DUPLICATE"
  | "HARD_TITLE_SIMILARITY"
  | "HARD_EMBEDDING_SIMILARITY"
  | "SAME_EVENT_DUPLICATE"
  | "WEAK_ANGLE_VARIANT"
  | "SOURCE_REPEAT_DUPLICATE";

export interface DuplicateDecisionDiagnostic {
  hiddenId: string;
  keptId: string;
  reason: DuplicateDecisionReason;
  score?: number;
  matchedId?: string;
  sourceGroup?: string;
  angle?: AngleLabel;
  note?: string;
}

export interface DuplicateDiagnosticsAccumulator {
  reasonCounts: Record<DuplicateDecisionReason, number>;
  decisions: DuplicateDecisionDiagnostic[];
}

export function createDuplicateDiagnostics(): DuplicateDiagnosticsAccumulator {
  return {
    reasonCounts: {
      CANONICAL_URL_DUPLICATE: 0,
      CANONICAL_TEXT_HASH_DUPLICATE: 0,
      HARD_TITLE_SIMILARITY: 0,
      HARD_EMBEDDING_SIMILARITY: 0,
      SAME_EVENT_DUPLICATE: 0,
      WEAK_ANGLE_VARIANT: 0,
      SOURCE_REPEAT_DUPLICATE: 0,
    },
    decisions: [],
  };
}

function recordDuplicateDecision(
  diagnostics: DuplicateDiagnosticsAccumulator | undefined,
  reason: DuplicateDecisionReason,
  hiddenStory: InsightStory,
  keptStory: InsightStory,
  score?: number,
  matchedId?: string,
  note?: string
): void {
  if (!diagnostics) return;

  diagnostics.reasonCounts[reason] = (diagnostics.reasonCounts[reason] || 0) + 1;

  const decision: DuplicateDecisionDiagnostic = {
    hiddenId: hiddenStory.id,
    keptId: keptStory.id,
    reason,
    score,
    matchedId,
    sourceGroup: hiddenStory.sourceGroup,
    angle: hiddenStory.angle,
    note,
  };

  if (diagnostics.decisions.length < 100) {
    diagnostics.decisions.push(decision);
  }

  (hiddenStory as any).duplicateDecision = decision;
}

export function getDuplicateDiagnosticsSummary(
  diagnostics: DuplicateDiagnosticsAccumulator
): Record<DuplicateDecisionReason, number> {
  return { ...diagnostics.reasonCounts };
}

// ── Similarity helpers ────────────────────────────────────────────────────────

/**
 * Cosine similarity between two dense vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na  += a[i] * a[i];
    nb  += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Character n-gram based title similarity (Jaccard on trigrams).
 * Lightweight proxy for edit-distance without heavy deps.
 */
export function titleSimilarity(a: string, b: string): number {
  const ngrams = (s: string, n = 3) => {
    const norm = s.toLowerCase().replace(/\s+/g, " ").trim();
    const set = new Set<string>();
    for (let i = 0; i <= norm.length - n; i++) set.add(norm.slice(i, i + n));
    return set;
  };
  const ga = ngrams(a);
  const gb = ngrams(b);
  let intersection = 0;
  for (const g of ga) if (gb.has(g)) intersection++;
  const union = ga.size + gb.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Jaccard overlap of two string arrays (lowercased).
 */
function jaccardOverlap(a: string[], b: string[]): number {
  const sa = new Set(a.map(x => x.toLowerCase()));
  const sb = new Set(b.map(x => x.toLowerCase()));
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter++;
  const union = sa.size + sb.size - inter;
  return union === 0 ? 0 : inter / union;
}

// ── Layer A: Hard Duplicate Removal ──────────────────────────────────────────

/**
 * Returns the de-duplicated list. Hidden duplicate IDs are pushed into
 * the provided `hiddenIds` set for later surfacing in the UI.
 *
 * Winner selection: highest sourceAuthority → earliest publishedAt.
 */
export function getAngleVariantDecision(
  candidate: InsightStory,
  selectedChildren: InsightStory[]
): {
  eligible: boolean;
  reason?: DuplicateDecisionReason;
  matchedId?: string;
  metrics?: {
    entityOverlap?: number;
    numberOverlap?: number;
    titleSimilarity?: number;
    embeddingSimilarity?: number;
  };
} {
  if (selectedChildren.length === 0) return { eligible: true };

  const sameAngle = selectedChildren.filter(c => c.angle === candidate.angle);
  if (sameAngle.length === 0) return { eligible: true };

  for (const existing of sameAngle) {
    const entOverlap = entityOverlap(candidate, existing);
    const numOverlap = numberFactMatch(candidate, existing);
    const titleSim = titleSimilarity(candidate.title, existing.title);
    const embedSim = cosineSimilarity(candidate.embedding, existing.embedding);

    if (entOverlap > 0.7 && numOverlap > 0.6 && embedSim > 0.85) {
      return {
        eligible: false,
        reason: "WEAK_ANGLE_VARIANT",
        matchedId: existing.id,
        metrics: {
          entityOverlap: entOverlap,
          numberOverlap: numOverlap,
          embeddingSimilarity: embedSim,
        },
      };
    }

    if (titleSim > 0.80 && embedSim > 0.80) {
      return {
        eligible: false,
        reason: "SAME_EVENT_DUPLICATE",
        matchedId: existing.id,
        metrics: {
          titleSimilarity: titleSim,
          embeddingSimilarity: embedSim,
        },
      };
    }
  }

  return { eligible: true };
}

export function removeHardDuplicates(
  stories: InsightStory[],
  cfg: InsightConfig,
  hiddenIds: Set<string>,
  diagnostics: DuplicateDiagnosticsAccumulator = createDuplicateDiagnostics()
): InsightStory[] {
  const kept: InsightStory[] = [];
  const seenUrls = new Map<string, InsightStory>();
  const seenHashes = new Map<string, InsightStory>();

  for (const story of stories) {
    if (seenUrls.has(story.canonicalUrl)) {
      const previous = seenUrls.get(story.canonicalUrl)!;
      const winner = pickWinner(previous, story);
      const hidden = winner === story ? previous : story;

      hiddenIds.add(hidden.id);
      recordDuplicateDecision(
        diagnostics,
        "CANONICAL_URL_DUPLICATE",
        hidden,
        winner,
        1,
        previous.id,
        "same canonical URL"
      );

      seenUrls.set(story.canonicalUrl, winner);
      continue;
    }

    if (seenHashes.has(story.canonicalTextHash)) {
      const previous = seenHashes.get(story.canonicalTextHash)!;
      const winner = pickWinner(previous, story);
      const hidden = winner === story ? previous : story;

      hiddenIds.add(hidden.id);
      recordDuplicateDecision(
        diagnostics,
        "CANONICAL_TEXT_HASH_DUPLICATE",
        hidden,
        winner,
        1,
        previous.id,
        "same canonical text hash"
      );

      seenHashes.set(story.canonicalTextHash, winner);
      continue;
    }

    const sameGroupMatch = kept.find(
      k => k.sourceGroup === story.sourceGroup &&
           titleSimilarity(k.title, story.title) >= cfg.HARD_DUP_TITLE_SIM
    );
    if (sameGroupMatch) {
      const score = titleSimilarity(sameGroupMatch.title, story.title);
      const winner = pickWinner(sameGroupMatch, story);
      const hidden = winner === story ? sameGroupMatch : story;

      hiddenIds.add(hidden.id);
      recordDuplicateDecision(
        diagnostics,
        "HARD_TITLE_SIMILARITY",
        hidden,
        winner,
        score,
        sameGroupMatch.id,
        `title similarity >= ${cfg.HARD_DUP_TITLE_SIM}`
      );

      if (winner !== sameGroupMatch) {
        const idx = kept.indexOf(sameGroupMatch);
        kept[idx] = winner;
      }
      continue;
    }

    const embedMatch = kept.find(
      k => cosineSimilarity(k.embedding, story.embedding) >= cfg.HARD_DUP_EMBED_SIM
    );
    if (embedMatch) {
      const score = cosineSimilarity(embedMatch.embedding, story.embedding);
      const winner = pickWinner(embedMatch, story);
      const hidden = winner === story ? embedMatch : story;

      hiddenIds.add(hidden.id);
      recordDuplicateDecision(
        diagnostics,
        "HARD_EMBEDDING_SIMILARITY",
        hidden,
        winner,
        score,
        embedMatch.id,
        `embedding similarity >= ${cfg.HARD_DUP_EMBED_SIM}`
      );

      if (winner !== embedMatch) {
        const idx = kept.indexOf(embedMatch);
        kept[idx] = winner;
      }
      continue;
    }

    seenUrls.set(story.canonicalUrl, story);
    seenHashes.set(story.canonicalTextHash, story);
    kept.push(story);
  }

  return kept;
}

function pickWinner(a: InsightStory, b: InsightStory): InsightStory {
  if (a.sourceAuthority !== b.sourceAuthority)
    return a.sourceAuthority > b.sourceAuthority ? a : b;
  return a.publishedAt <= b.publishedAt ? a : b; // earlier = original
}

// ── Layer B: Event Similarity (for clustering) ────────────────────────────────

/**
 * Composite event similarity score used for clustering decisions.
 * Returns a value 0..1.
 */
export function eventSimilarity(a: InsightStory, b: InsightStory): number {
  const embSim    = cosineSimilarity(a.embedding, b.embedding);
  const entSim    = entityOverlap(a, b);
  const verbSim   = verbMatch(a, b);
  const numSim    = numberFactMatch(a, b);
  const timeSim   = timeProximity(a, b);
  const placeSim  = jaccardOverlap(a.entities.places, b.entities.places);
  const catSim    = a.category && b.category && a.category === b.category ? 1 : 0;

  return (
    0.30 * embSim  +
    0.20 * entSim  +
    0.15 * verbSim +
    0.10 * numSim  +
    0.10 * timeSim +
    0.10 * placeSim +
    0.05 * catSim
  );
}

function entityOverlap(a: InsightStory, b: InsightStory): number {
  const orgs    = jaccardOverlap(a.entities.orgs, b.entities.orgs);
  const people  = jaccardOverlap(a.entities.people, b.entities.people);
  const products = jaccardOverlap(a.entities.products, b.entities.products);
  // orgs carry most weight for event identity
  return 0.5 * orgs + 0.3 * people + 0.2 * products;
}

function verbMatch(a: InsightStory, b: InsightStory): number {
  if (!a.eventVerbs.length || !b.eventVerbs.length) return 0;
  return jaccardOverlap(a.eventVerbs, b.eventVerbs);
}

function numberFactMatch(a: InsightStory, b: InsightStory): number {
  if (!a.numbers.length || !b.numbers.length) return 0;
  return jaccardOverlap(a.numbers, b.numbers);
}

function timeProximity(a: InsightStory, b: InsightStory): number {
  const diffMs = Math.abs(a.publishedAt - b.publishedAt);
  const diffH  = diffMs / (60 * 60 * 1000);
  if (diffH <= 1)  return 1.0;
  if (diffH <= 4)  return 0.8;
  if (diffH <= 12) return 0.6;
  if (diffH <= 24) return 0.3;
  return 0.0;
}

/**
 * Rule-based overrides applied on top of the similarity score.
 */
export function applyClusterOverrides(
  a: InsightStory,
  b: InsightStory,
  rawSim: number,
  cfg: InsightConfig
): "SAME" | "DIFFERENT" | "USE_SCORE" {
  // Force SAME
  const sameOrgs   = a.entities.orgs.some(o => b.entities.orgs.includes(o));
  const sameVerbs  = a.eventVerbs.some(v => b.eventVerbs.includes(v));
  const within24h  = Math.abs(a.publishedAt - b.publishedAt) < 24 * 60 * 60 * 1000;
  const sameRegion = jaccardOverlap(a.entities.places, b.entities.places) > 0.4;

  if (sameOrgs && sameVerbs && within24h && sameRegion) return "SAME";

  // Force DIFFERENT
  if (
    sameOrgs &&
    a.eventVerbs.length > 0 &&
    b.eventVerbs.length > 0 &&
    jaccardOverlap(a.eventVerbs, b.eventVerbs) < 0.1 // clearly different actions
  ) return "DIFFERENT";

  // Same org, unrelated categories
  if (
    sameOrgs &&
    a.category && b.category &&
    a.category !== b.category &&
    rawSim < cfg.POSSIBLE_EVENT_THRESHOLD
  ) return "DIFFERENT";

  return "USE_SCORE";
}

// ── Layer C: Angle Deduplication ─────────────────────────────────────────────

const OFFICIAL_SIGNALS = [
  /spokesperson/i, /minister/i, /official statement/i, /company said/i,
  /regulator said/i, /police confirmed/i, /government said/i, /mea/i,
  /secretary/i, /chairman/i, /ceo said/i, /officially announced/i,
  /government announced/i, /ministry announced/i, /regulator announced/i,
];

const MARKET_SIGNALS = [
  /shares rose/i, /shares fell/i, /stock (up|down)/i, /yields moved/i,
  /futures (dropped|rose)/i, /crypto (rally|fell)/i, /market reaction/i,
  /nifty/i, /sensex/i, /bse/i, /nse/i, /intraday/i,
];

const FACT_UPDATE_SIGNALS = [
  /toll (rises?|climbs?) to/i, /revised estimate/i, /updated count/i,
  /latest figures/i, /now confirmed/i, /figures updated/i,
  /new data/i, /updated figures/i,
  // NOTE: "correction:" deliberately removed — it belongs in CORRECTION_SIGNALS only
];

const EXPERT_SIGNALS = [
  /analysts? (say|warn|note)/i, /experts? (warn|say)/i, /economists? (note|say)/i,
  /think tank/i, /commentary/i, /crisil/i, /ficci/i, /cii/i, /imf/i,
];

const CORRECTION_SIGNALS = [
  /corrected/i, /clarified/i, /amended/i, /debunked/i, /false claim/i,
  /update:/i, /editor'?s? note/i,
];

const REGIONAL_SIGNALS = [
  /local impact/i, /state government/i, /city council/i,
  /chennai/i, /trichy/i, /tamil nadu/i, /muscat/i, /kerala/i,
  /regional/i,
];

const INVESTIGATIVE_SIGNALS = [
  /investigation/i, /leaked/i, /exclusive/i, /document shows/i,
  /sources say/i, /whistleblower/i,
];

/**
 * Classify a story's angle within a parent cluster.
 */
export function classifyAngle(story: InsightStory): AngleLabel {
  const text = story.title + " " + story.summary;

  if (CORRECTION_SIGNALS.some(p => p.test(text)))      return "correction";
  if (FACT_UPDATE_SIGNALS.some(p => p.test(text)))      return "fact_update";
  if (OFFICIAL_SIGNALS.some(p => p.test(text)))         return "official_response";
  if (MARKET_SIGNALS.some(p => p.test(text)))           return "market_reaction";
  if (EXPERT_SIGNALS.some(p => p.test(text)))           return "expert_analysis";
  if (INVESTIGATIVE_SIGNALS.some(p => p.test(text)))    return "investigative_detail";
  if (REGIONAL_SIGNALS.some(p => p.test(text)))         return "regional_followup";

  // Default: if it's the most authoritative summary-style text, base_report
  // (final assignment done after sorting cluster by parentRepresentativeScore)
  return "base_report";
}

/**
 * Determine whether a story adds genuinely new information over stories
 * already selected into the tree (angle-level dedup).
 * Returns true if the story should be ELIGIBLE, false if it's an angle duplicate.
 */
export function isAngleVariant(
  candidate: InsightStory,
  selectedChildren: InsightStory[]
): boolean {
  return getAngleVariantDecision(candidate, selectedChildren).eligible;
}
