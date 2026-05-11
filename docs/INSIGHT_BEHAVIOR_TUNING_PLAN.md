# NWv-7 Insight Behavior Tuning Plan

**Slice:** 11
**Status:** Plan only
**Production behavior changed:** No
**Purpose:** Prepare safe, measurable behavior changes for Insight deduplication, angle diversity, ranking, and tree-building without guessing.

---

## 1. Current proven checkpoint

The following slices are already proven by static tests and production build:

1. Slice 1 — QuickWeather configurable city widget
2. Slice 2 — navigation desktop/mobile correctness
3. Slice 3 — Market trust panel
4. Slice 4 — Weather trust panel
5. Slice 5 — Following professional desk
6. Slice 6 — Desktop polish
7. Slice 7 — Insight diagnostics foundation
8. Slice 8 — Insight source / angle / snapshot audit
9. Slice 9 — Insight real child-angle display
10. Slice 10 — Insight duplicate / ranking diagnostics

Slice 11 must not change runtime behavior. It exists to define the safe behavior-change sequence.

---

## 2. Current Insight problem statement

The user-observed problem is:

> Insight often shows very few useful angles, sometimes only one angle, and the story set may not feel connected to the most important top stories of the day.

The likely causes are not one single bug. They are a combination of:

1. Source coverage may be thin for the 24-hour window.
2. Clustering may merge related but not equivalent stories, or split same-story variants too aggressively.
3. Child tree selection may reject useful articles due to information gain, per-angle, or per-source gates.
4. Ranking may over-favor persistence/source diversity over today’s importance.
5. Duplicate filtering may hide too much, or hide correct variants that should appear as separate angles.
6. Snapshot representation may be weak across now, minus4h, minus12h, and minus24h.

Slices 7–10 now expose enough diagnostics to tune this safely.

---

## 3. Current relevant contracts

### 3.1 Config thresholds currently available

The Insight config already exposes:

- `TOP_PARENTS`
- `MAX_CHILDREN_PER_PARENT`
- `HARD_DUP_TITLE_SIM`
- `HARD_DUP_EMBED_SIM`
- `SAME_EVENT_THRESHOLD`
- `POSSIBLE_EVENT_THRESHOLD`
- `MIN_CHILD_INFO_GAIN`
- `REPLACE_MARGIN`
- `MAX_PER_SOURCE_GROUP`
- `MAX_PER_ANGLE`
- `MIN_SOURCES_PER_TREE`
- `WEAK_TREE_CHILD_MIN`
- `RISING_THRESHOLD`
- `REGION_BOOST`
- `REGION_TAGS`
- tier controls

Current known values from `DEFAULT_CONFIG`:

```txt
TOP_PARENTS = 5
MAX_CHILDREN_PER_PARENT = 7
HARD_DUP_TITLE_SIM = 0.96
HARD_DUP_EMBED_SIM = 0.985
SAME_EVENT_THRESHOLD = 0.88
POSSIBLE_EVENT_THRESHOLD = 0.75
MIN_CHILD_INFO_GAIN = 0.22
REPLACE_MARGIN = 0.08
MAX_PER_SOURCE_GROUP = 2
MAX_PER_ANGLE = 3
MIN_SOURCES_PER_TREE = 3
WEAK_TREE_CHILD_MIN = 3
RISING_THRESHOLD = 3
```

### 3.2 Existing diagnostic contracts

The following fields are already exposed or available:

* `parent.debug.scoreBreakdown`
* `parent.debug.hiddenCount`
* `parent.debug.replacements`
* `parent.hiddenDuplicateIds`
* `parent.clusterStoryIds`
* `parent.childStoryIds`
* `parent.snapshotPresence`
* `parent.weakTree`
* `parent.finalParentScore`
* story `angle`
* story `sourceGroup`
* story `capturedAtSnapshot`
* story `publishedAt`

No behavior should be changed until these diagnostics are reviewed on real data.

---

## 4. Required diagnostic review before behavior tuning

Before Slice 12 starts, collect screenshots or console observations from the current Insight page for at least one real run.

Record:

```txt
Insight run review:
Date/time:
Source mode: Live / Snapshot / Cached / Stale snapshot
Ranked clusters:
Source stories:
Signal score:
Multi-angle clusters:
Single-angle clusters:
Weak trees:
High duplicate pressure clusters:
High source concentration clusters:
High angle concentration clusters:
Top 3 clusters:
  1.
    headline:
    child count:
    angle count:
    source group count:
    snapshot count:
    hidden dupes:
    top ranking drivers:
  2.
  3.
```

This prevents blind tuning.

---

## 5. Behavior tuning sequence

### Slice 12 — Insight child-tree tuning only

**Goal:** Increase useful angle diversity per cluster without changing parent clustering.

Allowed files:

```txt
src/insight/src/tree/treeBuilder.ts
scripts/test_insight_tree_tuning_static.mjs
package.json
```

Candidate changes:

1. Add explicit debug fields to child candidate selection:

   * rejected by low information gain
   * rejected by max source group
   * rejected by max angle
   * rejected by not angle variant
2. Preserve `admittedBecause` on selected child story or parent debug.
3. Make weak-tree cause visible:

   * insufficient quality children
   * insufficient source diversity
   * insufficient angle diversity
4. Do not change thresholds in the first tree-tuning slice unless diagnostics prove the cause.

Possible later threshold changes, only after diagnostic proof:

```txt
MIN_CHILD_INFO_GAIN: 0.22 -> 0.18
MAX_PER_ANGLE: 3 -> 2 or keep 3 depending on angle concentration
MAX_PER_SOURCE_GROUP: 2 -> keep 2 unless source coverage is too thin
WEAK_TREE_CHILD_MIN: 3 -> keep 3
```

Pass criteria:

```txt
- Existing Insight tests pass.
- New tree diagnostic static test passes.
- npm run build passes.
- No ranking formula change.
- No dedup threshold change.
```

---

### Slice 13 — Insight duplicate diagnostics hardening only

**Goal:** Explain whether hidden duplicates are true duplicates or suppressed useful variants.

Allowed files:

```txt
src/insight/src/dedup/dedup.ts
src/insight/src/tree/treeBuilder.ts
scripts/test_insight_duplicate_diagnostics_static.mjs
package.json
```

Candidate changes:

1. Add reason codes for duplicate decisions:

   * hard title duplicate
   * hard embedding duplicate
   * same-event duplicate
   * weak angle variant
   * source-repeat duplicate
2. Store duplicate reason counts in parent debug.
3. Do not relax duplicate thresholds yet.

Do not immediately change:

```txt
HARD_DUP_TITLE_SIM
HARD_DUP_EMBED_SIM
SAME_EVENT_THRESHOLD
POSSIBLE_EVENT_THRESHOLD
```

Pass criteria:

```txt
- Duplicate reasons visible in diagnostics.
- No dedup threshold behavior change.
- No ranking formula change.
- npm run build passes.
```

---

### Slice 14 — Insight ranking reason clarity only

**Goal:** Make ranking reasons understandable, without changing ranking formula.

Allowed files:

```txt
src/insight/src/ranking/ranking.ts
scripts/test_insight_ranking_reason_static.mjs
package.json
```

Candidate changes:

1. Store weighted contribution, not only raw score:

   * impact contribution
   * persistence contribution
   * source diversity contribution
   * novelty contribution
   * freshness contribution
   * cross-snapshot momentum contribution
   * editorial clarity contribution
   * region boost contribution
2. Keep existing final score formula unchanged.
3. Add top ranking reason labels.

Pass criteria:

```txt
- Existing final score formula unchanged.
- Weighted contributions sum close to finalParentScore.
- Static test checks formula weights are preserved.
- npm run build passes.
```

---

### Slice 15 — First actual behavior tuning

**Goal:** Make the smallest behavior change supported by real diagnostics.

Allowed changes depend on diagnostic result:

#### Case A: too many single-angle clusters

Potential change:

```txt
treeBuilder.ts:
- keep max children 7
- lower MIN_CHILD_INFO_GAIN slightly from 0.22 to 0.18 only if many useful child candidates are rejected by information gain
```

Do not change dedup thresholds in the same slice.

#### Case B: too much source concentration

Potential change:

```txt
treeBuilder.ts:
- keep MAX_PER_SOURCE_GROUP = 2
- improve source diversity tie-break in child selection
```

Do not change ranking formula in the same slice.

#### Case C: too many hidden duplicates

Potential change:

```txt
dedup.ts:
- separate true duplicate from useful angle variant
- keep hard duplicate thresholds unchanged first
```

Do not change tree thresholds in the same slice.

#### Case D: ranking not related to top stories

Potential change:

```txt
ranking.ts:
- add diagnostic-only top-story anchoring first
- only then consider small weight change in freshness/novelty/impact
```

Do not change ranking and tree selection in the same slice.

Pass criteria:

```txt
- One behavior change only.
- Before/after diagnostics captured.
- Existing tests pass.
- New behavior-specific test passes.
- npm run build passes.
```

---

## 6. Explicit non-goals

The following must not be done in Slice 11:

```txt
- Do not change DEFAULT_CONFIG.
- Do not change dedup thresholds.
- Do not change ranking weights.
- Do not change child tree selection.
- Do not change source fetching.
- Do not add a GitHub workflow.
- Do not claim behavior is improved until real diagnostics prove it.
```

---

## 7. Review checklist before Slice 12

Before implementing Slice 12, answer these using the diagnostics now visible in the UI:

```txt
1. Are top clusters mostly single-angle?
2. Are child candidates missing because the source coverage is thin?
3. Are child candidates hidden as duplicates?
4. Is source concentration high?
5. Is angle concentration high?
6. Are weak-tree flags frequent?
7. Are high-ranked clusters actually low-quality?
8. Is ranking driven mostly by persistence/source diversity instead of freshness/novelty/impact?
9. Are hidden duplicates likely true duplicates or useful article variants?
10. Are all snapshots represented, or mostly only "now"?
```

Slice 12 must choose only one target based on these answers.

---

## 8. Mandatory checkpoint report for executing agent

After applying Slice 11, do not only say “done”.

Run the full gate and include the actual output summary.

Commands:

```bash
npm run test:quick-weather-pro
npm run test:bottom-nav
npm run test:market-trust
npm run test:weather-trust
npm run test:following
npm run test:desktop-polish
npm run test:insight-foundation
npm run test:insight-audit
npm run test:insight-angle-display
npm run test:insight-ranking-diagnostics
npm run test:insight-behavior-plan
npm run build
```

Required final checkpoint format:

```txt
CHECKPOINT RESULT:
- Slice applied: YES/NO
- Files changed:
  - docs/INSIGHT_BEHAVIOR_TUNING_PLAN.md
  - scripts/test_insight_behavior_plan_static.mjs
  - package.json
- Static tests passed: YES/NO
- Build passed: YES/NO
- Exact failed command, if any:
  - ...
- Last proven working checkpoint:
  - Slice 1 through Slice 10
- Same Agent Recommended if failed: YES
- Stop point:
  - If build/tests fail, stop and fix Slice 11 only. Do not start Slice 12.
```
