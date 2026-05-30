# Coverage Addendum — Deferred Deep-Read (Units 4 & 5 follow-up)

**Date:** 2026-05-30 · **Mode:** Auditor
**Purpose:** Close the coverage gaps flagged in Units 4/5. Two earlier findings are **corrected** here.
**Files deep-read now:** `insight/src/dedup/dedup.ts`, `insight/src/cluster/cluster.ts`, `insight/src/ranking/ranking.ts`, `intelligence/classification.js`, `intelligence/sourceTrust.js`, `services/googleNewsService.js` (+ `upAheadService` categorizer grep)

---

## Corrections to prior findings

| Prior | Status now | Evidence |
|-------|-----------|----------|
| **F5-5** (zero-vector cosine → NaN risk) | ❌ **NOT A BUG — closed** | `dedup.ts:220` guards `a.length !== b.length \|\| a.length === 0 → 0`; `:228` `denom === 0 ? 0 : …`. Zero vectors return 0, never NaN. |
| **U9-2** ("No movies listed" / `detectCategory`) | ⬇️ **Largely already fixed — downgrade** | `detectCategory` **no longer exists** in `upAheadService.js` (grep: only `categorySectionKey` remains). Categorization now flows through `classification.classifyItemCategory`, which uses **word-boundary regex** (`\b…\b`, `classification.js:18,34`) and Python prefetch. "Leo releasing on Oct 25" → `movies` (positive 'releasing', no offsetting negatives). **Residual work is only F2-7** (the negative-keyword lists still subtract in scoring) — tune + add the AUDIT cases as tests; the substring-vs-word-boundary fix is already done. |

## New (minor) findings

| ID | Sev | Finding | Instruction |
|----|-----|---------|-------------|
| **DA-1** | Low | **`opinion_editorial` angle missing from `ANGLE_DISPLAY_ORDER`.** `classifyAngle` (`dedup.ts:781,823`) can return `opinion_editorial`, but `treeBuilder.ANGLE_DISPLAY_ORDER` (Unit 5) doesn't list it → `indexOf` returns −1 → such children sort to the **front** (before `base_report`). | Add `opinion_editorial` to `ANGLE_DISPLAY_ORDER` at the intended position. |
| **DA-2** | Low | **Redundant `classifyAngle` calls.** Angle is classified in `removeHardDuplicates`, again in `cluster.createCanonicalParent`, and again in `treeBuilder.buildChildTree` (per story, per run). | Classify once during normalization and reuse `story.angle`. Minor perf + avoids drift. |
| **DA-3** | Low | **Fragile external Google topic hashes.** `googleNewsService.TOPICS` are hardcoded Base64 Google-internal topic IDs that Google can rotate, silently breaking `WORLD_IN`/`TAMIL_NADU`/`CHENNAI` feeds. (Business/Tech already use `*_SEARCH` fallbacks.) | Prefer `…/search?q=` URLs (robust) over topic-hash URLs, or add a health check that falls back when a topic feed returns 0 items. |
| **DA-4** | Low | **Substring matching in trust/region signals.** `sourceTrust.scoreSignals` and `ranking.computeRegionBoost` use `.includes()` (e.g., `'tickets'` matches `'ticketshop'`, `'tn'` over-matches). | Use word-boundary matching (the `classification.js` helper is the model) where false hits matter. |

## Confirmed high quality (no bugs found)
- **`dedup.ts`** — 3-layer hard-dedup (URL → text-hash → same-group title-sim → embedding-sim) with cross-source **useful-variant rescue** and full decision diagnostics; `pickWinner` = authority→earliest; guarded cosine; normalized `eventSimilarity` (weights sum to 1.0).
- **`cluster.ts`** — greedy single-pass with **centroid tracking** (incremental re-normalized mean, FIX M-1), ambiguous-range multi-story check (samples 5, avoids O(n²)), clickbait-penalized editorial clarity, normalized seed/representative scores.
- **`ranking.ts`** — 8-factor parent score (weights sum to 1.0), log-scaled source diversity, sigmoid momentum (FIX M-2), and **per-factor contribution diagnostics** (fully explainable "why this ranked here").
- **`classification.js`** — word-boundary keyword scoring with category/global negatives, source-type bonuses, confidence floors, decision trace.
- **`sourceTrust.js`** — curated domain-rule trust map (IMD/BookMyShow/OTT/airlines…) + keyword source-typing + signal scoring; conservative unknown-domain default.

## Coverage status
Deep-read: the insight pipeline core (pipeline, tree, dedup, cluster, ranking, embeddings, nlp, cache) and the intelligence spine (canonical, dateAware, deDuplication, classification, sourceTrust, editorial policies, eligibility, ingestion ledger). **Still not individually read** (consistent with the established quality pattern; recommend a final pass before formal sign-off, but no blocking risk observed): `insight/src/pipeline/normalize.ts`, the 4 `tree/*` variant selectors, `ranking/postTreeParentRerank.ts`, `diagnostics/*`, `quality/*`, and `intelligence/{feedHealthMonitor,feedSourceRegistry,locationAware,explainabilityAudit}.js`, `services/entertainmentService.js`, insight snapshot adapters.

## Net effect on the audit
The insight engine and editorial intelligence are **stronger than the mid-audit reports implied** — one flagged risk (F5-5) was a non-bug, and the headline "movie" bug is mostly already fixed. The High-severity backlog is unchanged and concentrated where it was: **weather automation/freshness, the timezone date-key helper, identity stability, and SLO/freshness convergence.**
