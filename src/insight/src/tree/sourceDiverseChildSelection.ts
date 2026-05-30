import {
  InsightConfig,
  InsightParent,
  InsightStory,
} from "../types";
import { classifyAngle } from "../dedup/dedup";

export interface SourceDiverseSelectionDiagnostic {
  formulaVersion: string;
  beforeChildCount: number;
  afterChildCount: number;
  beforeSourceGroupCount: number;
  afterSourceGroupCount: number;
  beforeAngleCount: number;
  afterAngleCount: number;
  targetSourceGroupCount: number;
  recoveredCount: number;
  replacedCount: number;
  rejectedCount: number;
  selectedIds: string[];
  recoveredCandidates: Array<{
    id: string;
    angle: string;
    sourceGroup: string;
    score: number;
    action: "add" | "replace";
    replacedId?: string;
    reasons: string[];
  }>;
  rejectedCandidates: Array<{
    id: string;
    angle: string;
    sourceGroup: string;
    score: number;
    reasons: string[];
  }>;
}

function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function getDebug(parent: InsightParent): any {
  if (!parent.debug) {
    (parent as any).debug = {
      clusterSize: 0,
      hiddenCount: 0,
      matchedSnapshots: [],
      scoreBreakdown: {},
      replacements: [],
    };
  }

  if (!Array.isArray(parent.debug.replacements)) {
    parent.debug.replacements = [];
  }

  return parent.debug as any;
}

function sourceGroup(story: InsightStory): string {
  return story.sourceGroup || story.source || "unknown-source";
}

function angleOf(story: InsightStory): string {
  if (!story.angle) story.angle = classifyAngle(story);
  return story.angle || "unknown";
}

function uniqueCount<T>(items: T[], mapper: (item: T) => string): number {
  return new Set(items.map(mapper).filter(Boolean)).size;
}

function countBy<T>(items: T[], mapper: (item: T) => string): Map<string, number> {
  const counts = new Map<string, number>();

  for (const item of items) {
    const key = mapper(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return counts;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function targetSourceGroupCount(clusterStories: InsightStory[], cfg: InsightConfig): number {
  const availableSources = uniqueCount(clusterStories, sourceGroup);
  const maxByChildren = Math.min(cfg.MAX_CHILDREN_PER_PARENT, availableSources);

  return Math.min(
    Math.max(2, cfg.MIN_SOURCES_PER_TREE),
    maxByChildren
  );
}

function candidateScore(story: InsightStory, selected: InsightStory[]): number {
  const selectedSources = new Set(selected.map(sourceGroup));
  const selectedAngles = new Set(selected.map(angleOf));

  const newSourceBonus = selectedSources.has(sourceGroup(story)) ? 0 : 0.38;
  const newAngleBonus = selectedAngles.has(angleOf(story)) ? 0 : 0.18;
  const tierPenalty = story.sourceTier === "D" ? 0.32 : 0;

  return round3(
    0.26 * clamp01(Number(story.sourceAuthority || 0)) +
      0.20 * clamp01(Number(story.freshnessScore || 0)) +
      0.16 * clamp01(Number(story.rawProminence || 0)) +
      0.14 * clamp01(Number(story.factualDensity || 0)) +
      0.10 * clamp01(Number(story.summaryQuality || 0)) +
      newSourceBonus +
      newAngleBonus -
      tierPenalty
  );
}

function evaluateSourceCandidate(
  candidate: InsightStory,
  selected: InsightStory[],
  cfg: InsightConfig
): { accept: boolean; score: number; reasons: string[] } {
  const reasons: string[] = [];
  const score = candidateScore(candidate, selected);

  const selectedSources = new Set(selected.map(sourceGroup));
  const selectedAngles = new Set(selected.map(angleOf));

  if (candidate.sourceTier === "D" && cfg.TIER_D_EXCLUDE) {
    return {
      accept: false,
      score,
      reasons: ["tier D candidate excluded"],
    };
  }

  if (Number(candidate.sourceAuthority || 0) < 0.35) {
    return {
      accept: false,
      score,
      reasons: ["source authority below source-diversity floor"],
    };
  }

  if (!selectedSources.has(sourceGroup(candidate))) {
    reasons.push("adds new source group: " + sourceGroup(candidate));
  }

  if (!selectedAngles.has(angleOf(candidate))) {
    reasons.push("also adds new angle: " + angleOf(candidate));
  }

  if (!reasons.some(reason => reason.startsWith("adds new source group"))) {
    return {
      accept: false,
      score,
      reasons: ["does not improve source diversity"],
    };
  }

  if (score < 0.58) {
    return {
      accept: false,
      score,
      reasons: ["below source-diversity score floor"],
    };
  }

  return {
    accept: true,
    score,
    reasons,
  };
}

function replacementKeepsAngleDiversity(
  selected: InsightStory[],
  outgoing: InsightStory,
  incoming: InsightStory
): boolean {
  const beforeAngleCount = uniqueCount(selected, angleOf);
  const after = selected.map(story => story.id === outgoing.id ? incoming : story);
  const afterAngleCount = uniqueCount(after, angleOf);

  return afterAngleCount >= Math.min(beforeAngleCount, 2);
}

function getReplaceableSourceDuplicate(
  selected: InsightStory[],
  incoming: InsightStory
): InsightStory | null {
  const sourceCounts = countBy(selected, sourceGroup);
  const angleCounts = countBy(selected, angleOf);
  const incomingSource = sourceGroup(incoming);

  const candidates = selected
    .filter(story => sourceGroup(story) !== incomingSource)
    .map(story => {
      const sourceRepeatPenalty = (sourceCounts.get(sourceGroup(story)) || 0) > 1 ? 0.42 : 0;
      const angleRepeatPenalty = (angleCounts.get(angleOf(story)) || 0) > 1 ? 0.18 : 0;

      const quality =
        0.30 * clamp01(Number(story.sourceAuthority || 0)) +
        0.24 * clamp01(Number(story.freshnessScore || 0)) +
        0.18 * clamp01(Number(story.rawProminence || 0)) +
        0.14 * clamp01(Number(story.factualDensity || 0)) +
        0.14 * clamp01(Number(story.summaryQuality || 0));

      return {
        story,
        replaceability: sourceRepeatPenalty + angleRepeatPenalty - quality * 0.18,
      };
    })
    .filter(item => replacementKeepsAngleDiversity(selected, item.story, incoming))
    .sort((a, b) => b.replaceability - a.replaceability);

  return candidates[0]?.story || null;
}

function annotateRecovered(story: InsightStory, reasons: string[], score: number): InsightStory {
  (story as any).admittedBecause = [
    "source-diverse child selection",
    ...reasons,
  ];

  (story as any).childScore = Math.max(
    Number((story as any).childScore || 0),
    score
  );

  (story as any).informationGain = Math.max(
    Number((story as any).informationGain || 0),
    reasons.some(reason => reason.startsWith("adds new source group")) ? 0.52 : 0.30
  );

  return story;
}

export function enforceSourceDiverseChildSelection(
  parent: InsightParent,
  selectedChildren: InsightStory[],
  clusterStories: InsightStory[],
  cfg: InsightConfig,
  hiddenIds: Set<string>
): InsightStory[] {
  const selected = [...safeArray(selectedChildren)];
  const cluster = safeArray(clusterStories);

  for (const story of selected) angleOf(story);
  for (const story of cluster) angleOf(story);

  const target = targetSourceGroupCount(cluster, cfg);
  const beforeSourceGroupCount = uniqueCount(selected, sourceGroup);
  const beforeAngleCount = uniqueCount(selected, angleOf);

  const diagnostics: SourceDiverseSelectionDiagnostic = {
    formulaVersion: "source-diverse-child-selection-v1",
    beforeChildCount: selected.length,
    afterChildCount: selected.length,
    beforeSourceGroupCount,
    afterSourceGroupCount: beforeSourceGroupCount,
    beforeAngleCount,
    afterAngleCount: beforeAngleCount,
    targetSourceGroupCount: target,
    recoveredCount: 0,
    replacedCount: 0,
    rejectedCount: 0,
    selectedIds: selected.map(story => story.id),
    recoveredCandidates: [],
    rejectedCandidates: [],
  };

  const debug = getDebug(parent);
  debug.sourceDiverseSelectionDiagnostics = diagnostics;

  if (beforeSourceGroupCount >= target) {
    return selected;
  }

  const selectedIds = new Set(selected.map(story => story.id));

  const remaining = cluster
    .filter(story => !selectedIds.has(story.id))
    .map(story => ({
      story,
      decision: evaluateSourceCandidate(story, selected, cfg),
    }))
    .sort((a, b) => b.decision.score - a.decision.score);

  for (const item of remaining) {
    if (uniqueCount(selected, sourceGroup) >= target) break;

    const { story, decision } = item;

    if (!decision.accept) {
      diagnostics.rejectedCount += 1;
      diagnostics.rejectedCandidates.push({
        id: story.id,
        angle: angleOf(story),
        sourceGroup: sourceGroup(story),
        score: decision.score,
        reasons: decision.reasons,
      });
      continue;
    }

    const recovered = annotateRecovered(story, decision.reasons, decision.score);

    if (selected.length < cfg.MAX_CHILDREN_PER_PARENT) {
      selected.push(recovered);
      hiddenIds.delete(recovered.id);

      diagnostics.recoveredCount += 1;
      diagnostics.recoveredCandidates.push({
        id: recovered.id,
        angle: angleOf(recovered),
        sourceGroup: sourceGroup(recovered),
        score: decision.score,
        action: "add",
        reasons: decision.reasons,
      });
      continue;
    }

    const replaceTarget = getReplaceableSourceDuplicate(selected, recovered);

    if (!replaceTarget) {
      diagnostics.rejectedCount += 1;
      diagnostics.rejectedCandidates.push({
        id: story.id,
        angle: angleOf(story),
        sourceGroup: sourceGroup(story),
        score: decision.score,
        reasons: ["no replaceable same-source-heavy child without reducing angle diversity"],
      });
      continue;
    }

    const index = selected.findIndex(child => child.id === replaceTarget.id);
    if (index < 0) continue;

    selected[index] = recovered;
    hiddenIds.add(replaceTarget.id);
    hiddenIds.delete(recovered.id);

    debug.replacements.push({
      replacedId: replaceTarget.id,
      replacedBy: recovered.id,
      reason: "source-diverse child selection: " + decision.reasons.join(", "),
    });

    diagnostics.recoveredCount += 1;
    diagnostics.replacedCount += 1;
    diagnostics.recoveredCandidates.push({
      id: recovered.id,
      angle: angleOf(recovered),
      sourceGroup: sourceGroup(recovered),
      score: decision.score,
      action: "replace",
      replacedId: replaceTarget.id,
      reasons: decision.reasons,
    });
  }

  diagnostics.afterChildCount = selected.length;
  diagnostics.afterSourceGroupCount = uniqueCount(selected, sourceGroup);
  diagnostics.afterAngleCount = uniqueCount(selected, angleOf);
  diagnostics.selectedIds = selected.map(story => story.id);

  return orderSourceDiverseChildrenForDisplay(selected);
}

export function orderSourceDiverseChildrenForDisplay(stories: InsightStory[]): InsightStory[] {
  return [...stories].sort((a, b) => {
    const angleDelta = angleOf(a).localeCompare(angleOf(b));
    if (angleDelta !== 0) return angleDelta;

    const sourceDelta = sourceGroup(a).localeCompare(sourceGroup(b));
    if (sourceDelta !== 0) return sourceDelta;

    return b.freshnessScore - a.freshnessScore;
  });
}
