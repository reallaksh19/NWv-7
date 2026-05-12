// ─────────────────────────────────────────────
//  INSIGHT TAB — Tree Builder
// ─────────────────────────────────────────────

import {
  InsightStory,
  InsightParent,
  InsightConfig,
  AngleLabel,
  ChildCandidate,
} from "../types";
import { cosineSimilarity, getAngleVariantDecision, classifyAngle } from "../dedup/dedup";

// ── Angle display order ───────────────────────────────────────────────────────

const ANGLE_DISPLAY_ORDER: AngleLabel[] = [
  "base_report",
  "official_response",
  "fact_update",
  "market_reaction",
  "expert_analysis",
  "regional_followup",
  "investigative_detail",
  "correction",
  "background_context",
  "reaction_public",
  "unknown",
];

// ── Diagnostics types ─────────────────────────────────────────────────────────

type ChildRejectionReason =
  | "LOW_INFORMATION_GAIN"
  | "MAX_SOURCE_GROUP"
  | "MAX_ANGLE"
  | "NOT_ANGLE_VARIANT";

interface RejectedCandidateDiagnostic {
  id: string;
  angle: AngleLabel;
  sourceGroup: string;
  informationGain: number;
  childScore: number;
  relevanceToParent: number;
  reasons: ChildRejectionReason[];
}

interface AdmittedChildDiagnostic {
  id: string;
  angle: AngleLabel;
  sourceGroup: string;
  informationGain: number;
  childScore: number;
  admittedBecause: string[];
}

interface WeakTreeDiagnostics {
  causes: string[];
  childCount: number;
  qualityChildCount: number;
  sourceGroupCount: number;
  angleCount: number;
  weakTreeChildMin: number;
  minSourcesPerTree: number;
}

interface ChildSelectionDiagnostics {
  candidateCount: number;
  selectedCount: number;
  hiddenCount: number;
  iterationCount: number;
  remainingCandidateCount: number;
  thresholds: {
    minChildInfoGain: number;
    maxPerSourceGroup: number;
    maxPerAngle: number;
    maxChildrenPerParent: number;
    weakTreeChildMin: number;
    minSourcesPerTree: number;
  };
  rejectionCounts: Record<ChildRejectionReason, number>;
  rejectedCandidates: RejectedCandidateDiagnostic[];
  admittedChildren: AdmittedChildDiagnostic[];
  duplicateDowngrades: Array<{
    selectedId: string;
    downgradedId: string;
    similarity: number;
    penalty: number;
  }>;
  duplicateReasonCounts: Record<string, number>;
  duplicateDecisionSamples: Array<{
    id: string;
    angle: AngleLabel;
    sourceGroup: string;
    reason: string;
    matchedId?: string;
    metrics?: Record<string, number>;
  }>;
  weakTreeCauses: string[];
  weakTreeMetrics: WeakTreeDiagnostics;
}

// ── Debug helpers ─────────────────────────────────────────────────────────────

function getParentDebug(parent: InsightParent): any {
  if (!parent.debug) {
    (parent as any).debug = {};
  }

  if (!Array.isArray(parent.debug.replacements)) {
    parent.debug.replacements = [];
  }

  return parent.debug as any;
}

function initChildSelectionDiagnostics(
  parent: InsightParent,
  cfg: InsightConfig,
  candidateCount: number
): ChildSelectionDiagnostics {
  const diagnostics: ChildSelectionDiagnostics = {
    candidateCount,
    selectedCount: 0,
    hiddenCount: 0,
    iterationCount: 0,
    remainingCandidateCount: candidateCount,
    thresholds: {
      minChildInfoGain: cfg.MIN_CHILD_INFO_GAIN,
      maxPerSourceGroup: cfg.MAX_PER_SOURCE_GROUP,
      maxPerAngle: cfg.MAX_PER_ANGLE,
      maxChildrenPerParent: cfg.MAX_CHILDREN_PER_PARENT,
      weakTreeChildMin: cfg.WEAK_TREE_CHILD_MIN,
      minSourcesPerTree: cfg.MIN_SOURCES_PER_TREE,
    },
    rejectionCounts: {
      LOW_INFORMATION_GAIN: 0,
      MAX_SOURCE_GROUP: 0,
      MAX_ANGLE: 0,
      NOT_ANGLE_VARIANT: 0,
    },
    rejectedCandidates: [],
    admittedChildren: [],
    duplicateDowngrades: [],
    duplicateReasonCounts: {},
    duplicateDecisionSamples: [],
    weakTreeCauses: [],
    weakTreeMetrics: {
      causes: [],
      childCount: 0,
      qualityChildCount: 0,
      sourceGroupCount: 0,
      angleCount: 0,
      weakTreeChildMin: cfg.WEAK_TREE_CHILD_MIN,
      minSourcesPerTree: cfg.MIN_SOURCES_PER_TREE,
    },
  };

  getParentDebug(parent).childSelectionDiagnostics = diagnostics;
  return diagnostics;
}

function incrementRejectionCount(
  diagnostics: ChildSelectionDiagnostics,
  reason: ChildRejectionReason
): void {
  diagnostics.rejectionCounts[reason] =
    (diagnostics.rejectionCounts[reason] || 0) + 1;
}

function pushLimited<T>(target: T[], item: T, limit = 50): void {
  if (target.length < limit) target.push(item);
}

function getCandidateRejectionDetails(
  candidate: ChildCandidate,
  selected: InsightStory[],
  cfg: InsightConfig
): {
  reasons: ChildRejectionReason[];
  angleVariantDecision: ReturnType<typeof getAngleVariantDecision>;
} {
  const reasons: ChildRejectionReason[] = [];

  if (candidate.informationGain < cfg.MIN_CHILD_INFO_GAIN) {
    reasons.push("LOW_INFORMATION_GAIN");
  }

  const sourceGroupCount = selected.filter(
    s => s.sourceGroup === candidate.story.sourceGroup
  ).length;
  if (sourceGroupCount >= cfg.MAX_PER_SOURCE_GROUP) {
    reasons.push("MAX_SOURCE_GROUP");
  }

  const angleCount = selected.filter(s => s.angle === candidate.angle).length;
  if (angleCount >= cfg.MAX_PER_ANGLE) {
    reasons.push("MAX_ANGLE");
  }

  const angleVariantDecision = getAngleVariantDecision(candidate.story, selected);
  if (!angleVariantDecision.eligible) {
    reasons.push("NOT_ANGLE_VARIANT");
  }

  return {
    reasons,
    angleVariantDecision,
  };
}

function getCandidateRejectionReasons(
  candidate: ChildCandidate,
  selected: InsightStory[],
  cfg: InsightConfig
): ChildRejectionReason[] {
  return getCandidateRejectionDetails(candidate, selected, cfg).reasons;
}

function buildRejectedCandidateDiagnostic(
  candidate: ChildCandidate,
  reasons: ChildRejectionReason[]
): RejectedCandidateDiagnostic {
  return {
    id: candidate.story.id,
    angle: candidate.angle,
    sourceGroup: candidate.story.sourceGroup,
    informationGain: round3(candidate.informationGain),
    childScore: round3(candidate.childScore),
    relevanceToParent: round3(candidate.relevanceToParent),
    reasons,
  };
}

function recordDuplicateDecisionSample(
  diagnostics: ChildSelectionDiagnostics,
  candidate: ChildCandidate,
  decision: ReturnType<typeof getAngleVariantDecision>
): void {
  if (decision.eligible || !decision.reason) return;

  diagnostics.duplicateReasonCounts[decision.reason] =
    (diagnostics.duplicateReasonCounts[decision.reason] || 0) + 1;

  pushLimited(diagnostics.duplicateDecisionSamples, {
    id: candidate.story.id,
    angle: candidate.angle,
    sourceGroup: candidate.story.sourceGroup,
    reason: decision.reason,
    matchedId: decision.matchedId,
    metrics: decision.metrics,
  });
}

function recordCandidateRejection(
  diagnostics: ChildSelectionDiagnostics,
  candidate: ChildCandidate,
  reasons: ChildRejectionReason[]
): void {
  for (const reason of reasons) {
    incrementRejectionCount(diagnostics, reason);
  }

  pushLimited(
    diagnostics.rejectedCandidates,
    buildRejectedCandidateDiagnostic(candidate, reasons)
  );
}

function recordAdmittedChild(
  diagnostics: ChildSelectionDiagnostics,
  candidate: ChildCandidate,
  admittedBecause: string[]
): void {
  pushLimited(diagnostics.admittedChildren, {
    id: candidate.story.id,
    angle: candidate.angle,
    sourceGroup: candidate.story.sourceGroup,
    informationGain: round3(candidate.informationGain),
    childScore: round3(candidate.childScore),
    admittedBecause,
  });
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function getWeakTreeCause(
  children: InsightStory[],
  cfg: InsightConfig
): WeakTreeDiagnostics {
  const qualityChildren = children.filter(s => {
    return s.freshnessScore >= 0.45 && s.sourceAuthority >= 0.45;
  });

  const sourceGroupCount = new Set(children.map(s => s.sourceGroup)).size;
  const angleCount = new Set(children.map(s => s.angle ?? "unknown")).size;
  const causes: string[] = [];

  if (children.length < cfg.WEAK_TREE_CHILD_MIN) {
    causes.push("INSUFFICIENT_CHILDREN");
  }

  if (qualityChildren.length < cfg.WEAK_TREE_CHILD_MIN) {
    causes.push("INSUFFICIENT_QUALITY_CHILDREN");
  }

  if (sourceGroupCount < cfg.MIN_SOURCES_PER_TREE) {
    causes.push("INSUFFICIENT_SOURCE_DIVERSITY");
  }

  if (angleCount < 2) {
    causes.push("INSUFFICIENT_ANGLE_DIVERSITY");
  }

  if (causes.length === 0) {
    causes.push("NO_WEAK_TREE_CAUSE_DETECTED");
  }

  return {
    causes,
    childCount: children.length,
    qualityChildCount: qualityChildren.length,
    sourceGroupCount,
    angleCount,
    weakTreeChildMin: cfg.WEAK_TREE_CHILD_MIN,
    minSourcesPerTree: cfg.MIN_SOURCES_PER_TREE,
  };
}

// ── Information gain ──────────────────────────────────────────────────────────

/**
 * How much new signal a candidate adds over already-selected children.
 */
function computeInformationGain(
  candidate: InsightStory,
  selected: InsightStory[],
  parent: InsightParent,
): number {
  if (selected.length === 0) return 1.0;

  // New facts score: unique numbers not yet in selected set
  const selectedNumbers = new Set(selected.flatMap(s => s.numbers));
  const newNumbers      = candidate.numbers.filter(n => !selectedNumbers.has(n)).length;
  const newFactsScore   = Math.min(1, newNumbers / 3);

  // New angle score: 1.0 if no selected story has this angle, else 0
  const angleSeen    = selected.some(s => s.angle === candidate.angle);
  const newAngleScore = angleSeen ? 0.0 : 1.0;

  // New source perspective: 1.0 if sourceGroup not yet in selected
  const sourcesSeen       = new Set(selected.map(s => s.sourceGroup));
  const newSourceScore    = sourcesSeen.has(candidate.sourceGroup) ? 0.0 : 0.8;

  // Redundancy penalty: semantic similarity to most similar selected child
  const maxSim          = selected.reduce((max, s) => {
    const sim = cosineSimilarity(candidate.embedding, s.embedding);
    return sim > max ? sim : max;
  }, 0);
  const redundancyPenalty = Math.max(0, (maxSim - 0.70) * 2); // penalty starts at 0.70 sim

  // FIX H-2: weights now sum to 1.0 (was 0.9 — newSourceScore was 0.2, raised to 0.3)
  return Math.max(0,
    0.4 * newFactsScore +
    0.3 * newAngleScore +
    0.3 * newSourceScore -
    0.1 * redundancyPenalty
  );
}

// ── Child score ───────────────────────────────────────────────────────────────

function computeChildScore(
  candidate: ChildCandidate,
  selected: InsightStory[],
  parent: InsightParent,
): number {
  // relevanceToParent: cosine similarity of candidate vs cluster centroid
  // (we approximate centroid as the similarity to keyVerbs/entities presence)
  const relevanceToParent = candidate.relevanceToParent;

  // Source diversity bonus: how much adding this source improves diversity
  const existingGroups = new Set(selected.map(s => s.sourceGroup));
  const sourceDiversityBonus = existingGroups.has(candidate.story.sourceGroup) ? 0.0 : 0.5;

  // Angle uniqueness: higher if this angle is not yet in selected
  const angleSeen      = selected.some(s => s.angle === candidate.angle);
  const angleUniqueness = angleSeen ? 0.1 : 1.0;

  // Summary compactness: prefer stories that can be shown in 2–3 lines
  const words = candidate.story.summary.split(/\s+/).length;
  const summaryCompactness = words >= 15 && words <= 60 ? 1.0 : 0.5;

  return (
    0.30 * relevanceToParent              +
    0.20 * candidate.informationGain      +
    0.15 * candidate.story.freshnessScore +
    0.10 * candidate.story.sourceAuthority +
    0.10 * sourceDiversityBonus           +
    0.10 * angleUniqueness                +
    0.05 * summaryCompactness
  );
}

// ── Relevance to parent ───────────────────────────────────────────────────────

function computeRelevanceToParent(story: InsightStory, parent: InsightParent): number {
  // Entity overlap with parent's key entities
  const allStoryEntities = [
    ...story.entities.orgs,
    ...story.entities.places,
    ...story.entities.people,
  ].map(e => e.toLowerCase());

  const parentEntities = [...parent.keyEntities, ...parent.keyPlaces].map(e => e.toLowerCase());
  const entityMatches  = allStoryEntities.filter(e => parentEntities.includes(e)).length;
  const entityScore    = Math.min(1, entityMatches / Math.max(1, parentEntities.length));

  // Verb overlap with parent's key verbs
  const verbMatches = story.eventVerbs.filter(v =>
    parent.keyVerbs.map(k => k.toLowerCase()).includes(v.toLowerCase())
  ).length;
  const verbScore = Math.min(1, verbMatches / Math.max(1, parent.keyVerbs.length));

  return 0.6 * entityScore + 0.4 * verbScore;
}

// ── Constraint checks ─────────────────────────────────────────────────────────

function passesConstraints(
  candidate: ChildCandidate,
  selected: InsightStory[],
  cfg: InsightConfig
): boolean {
  const sourceGroupCount = selected.filter(s => s.sourceGroup === candidate.story.sourceGroup).length;
  if (sourceGroupCount >= cfg.MAX_PER_SOURCE_GROUP) return false;

  const angleCount = selected.filter(s => s.angle === candidate.angle).length;
  if (angleCount >= cfg.MAX_PER_ANGLE) return false;

  return true;
}

// ── Main tree builder ─────────────────────────────────────────────────────────

export function buildChildTree(
  parent: InsightParent,
  clusterStories: InsightStory[],
  cfg: InsightConfig,
  hiddenIds: Set<string>
): InsightStory[] {
  // Classify angles
  const tagged = clusterStories.map(s => ({
    ...s,
    parentId: parent.parentId,
    angle: classifyAngle(s),
  }));

  // Build candidate pool
  const candidates: ChildCandidate[] = tagged.map(story => ({
    story,
    angle: story.angle!,
    relevanceToParent: computeRelevanceToParent(story, parent),
    informationGain: 0, // computed iteratively
    sourceDiversityBonus: 0,
    angleUniqueness: 0,
    childScore: 0,
  }));

  const diagnostics = initChildSelectionDiagnostics(parent, cfg, candidates.length);
  const selected: InsightStory[] = [];
  const remaining = [...candidates];

  while (selected.length < cfg.MAX_CHILDREN_PER_PARENT && remaining.length > 0) {
    diagnostics.iterationCount += 1;

    // Update dynamic scores with current selected set
    for (const c of remaining) {
      c.informationGain = computeInformationGain(c.story, selected, parent);
      c.childScore      = computeChildScore(c, selected, parent);
    }

    // Filter: must pass information gain gate AND constraint checks.
    // This preserves the original behavior while recording the reason each
    // non-eligible candidate was excluded from the child tree.
    const eligible = remaining.filter(c => {
      const rejectionDetails = getCandidateRejectionDetails(c, selected, cfg);
      const reasons = rejectionDetails.reasons;

      if (reasons.length > 0) {
        recordCandidateRejection(diagnostics, c, reasons);
        recordDuplicateDecisionSample(diagnostics, c, rejectionDetails.angleVariantDecision);
        return false;
      }

      return true;
    });

    if (eligible.length === 0) break;

    // Pick best
    const best = eligible.reduce((a, b) => (b.childScore > a.childScore ? b : a));

    const admittedBecause = buildAdmitReason(best, selected);
    best.admittedBecause = admittedBecause;

    // Preserve admission reasons directly on the story object for downstream
    // diagnostics. This does not affect ranking, dedup, or selection behavior.
    (best.story as any).admittedBecause = admittedBecause;
    (best.story as any).childScore = round3(best.childScore);
    (best.story as any).informationGain = round3(best.informationGain);

    recordAdmittedChild(diagnostics, best, admittedBecause);
    selected.push(best.story);

    // Remove chosen from remaining
    const idx = remaining.indexOf(best);
    remaining.splice(idx, 1);

    // Downgrade near-duplicates of chosen story in remaining candidates.
    // Existing behavior is preserved; this slice only records diagnostics.
    for (const c of remaining) {
      const sim = cosineSimilarity(best.story.embedding, c.story.embedding);
      if (sim > 0.85) {
        c.informationGain = Math.max(0, c.informationGain - 0.15);
        pushLimited(diagnostics.duplicateDowngrades, {
          selectedId: best.story.id,
          downgradedId: c.story.id,
          similarity: round3(sim),
          penalty: 0.15,
        });
      }
    }
  }

  // Remaining non-selected → hidden duplicates
  for (const c of remaining) {
    hiddenIds.add(c.story.id);
  }

  const weakTreeMetrics = getWeakTreeCause(selected, cfg);

  parent.debug.hiddenCount = hiddenIds.size;
  diagnostics.selectedCount = selected.length;
  diagnostics.hiddenCount = hiddenIds.size;
  diagnostics.remainingCandidateCount = remaining.length;
  diagnostics.weakTreeCauses = weakTreeMetrics.causes;
  diagnostics.weakTreeMetrics = weakTreeMetrics;

  // Sort for display
  return orderChildrenForDisplay(selected);
}

// ── Tree replacement (when called for incremental updates) ────────────────────

export function tryReplaceWeakestChild(
  parent: InsightParent,
  selectedChildren: InsightStory[],
  candidate: InsightStory,
  cfg: InsightConfig,
  hiddenIds: Set<string>
): InsightStory[] {
  if (selectedChildren.length < cfg.MAX_CHILDREN_PER_PARENT) {
    selectedChildren.push(candidate);
    return selectedChildren;
  }

  // Score candidate as child
  const candRelevance = computeRelevanceToParent(candidate, parent);
  const candGain      = computeInformationGain(candidate, selectedChildren, parent);
  const candCandidate: ChildCandidate = {
    story: candidate,
    angle: candidate.angle!,
    relevanceToParent: candRelevance,
    informationGain: candGain,
    sourceDiversityBonus: 0,
    angleUniqueness: 0,
    childScore: 0,
  };
  candCandidate.childScore = computeChildScore(candCandidate, selectedChildren, parent);

  // Find weakest current child
  const scoredChildren = selectedChildren.map(s => {
    const c: ChildCandidate = {
      story: s,
      angle: s.angle!,
      relevanceToParent: computeRelevanceToParent(s, parent),
      informationGain: computeInformationGain(s, selectedChildren.filter(x => x !== s), parent),
      sourceDiversityBonus: 0,
      angleUniqueness: 0,
      childScore: 0,
    };
    c.childScore = computeChildScore(c, selectedChildren.filter(x => x !== s), parent);
    return c;
  });

  const weakest = scoredChildren.reduce((a, b) => (b.childScore < a.childScore ? b : a));

  // Only replace if candidate meaningfully beats weakest AND adds new angle
  if (
    candCandidate.childScore > weakest.childScore + cfg.REPLACE_MARGIN &&
    candCandidate.informationGain >= cfg.MIN_CHILD_INFO_GAIN &&
    (candidate.angle !== weakest.story.angle ||
     candCandidate.story.sourceGroup !== weakest.story.sourceGroup)
  ) {
    hiddenIds.add(weakest.story.id);

    const admitReason = buildAdmitReason(candCandidate, selectedChildren);
    getParentDebug(parent).replacements.push({
      replacedId: weakest.story.id,
      replacedBy: candidate.id,
      reason: admitReason.join(", "),
    });

    (candidate as any).admittedBecause = admitReason;
    (candidate as any).childScore = round3(candCandidate.childScore);
    (candidate as any).informationGain = round3(candCandidate.informationGain);

    return [
      ...selectedChildren.filter(s => s.id !== weakest.story.id),
      candidate,
    ];
  }

  hiddenIds.add(candidate.id);
  return selectedChildren;
}

// ── Display ordering ──────────────────────────────────────────────────────────

function orderChildrenForDisplay(stories: InsightStory[]): InsightStory[] {
  return [...stories].sort((a, b) => {
    const ai = ANGLE_DISPLAY_ORDER.indexOf(a.angle ?? "unknown");
    const bi = ANGLE_DISPLAY_ORDER.indexOf(b.angle ?? "unknown");
    if (ai !== bi) return ai - bi;
    return b.freshnessScore - a.freshnessScore;
  });
}

// ── Weak tree detection ───────────────────────────────────────────────────────

export function isWeakTree(children: InsightStory[], cfg: InsightConfig): boolean {
  const qualityChildren = children.filter(s => {
    // Proxy for quality: high freshnessScore + decent authority
    return s.freshnessScore >= 0.45 && s.sourceAuthority >= 0.45;
  });
  return qualityChildren.length < cfg.WEAK_TREE_CHILD_MIN;
}

// ── Debug helper ──────────────────────────────────────────────────────────────

function buildAdmitReason(c: ChildCandidate, selected: InsightStory[]): string[] {
  const reasons: string[] = [];
  const existingAngles = new Set(selected.map(s => s.angle));
  if (!existingAngles.has(c.angle)) reasons.push(`new angle: ${c.angle}`);
  if (c.informationGain >= 0.5)     reasons.push("high information gain");
  if (c.story.numbers.length > 0)   reasons.push("contains new numbers/facts");
  if (!selected.some(s => s.sourceGroup === c.story.sourceGroup))
    reasons.push("new source group");
  return reasons.length > 0 ? reasons : ["best available candidate"];
}