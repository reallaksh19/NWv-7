# Oracle (ideal) vs Actual (pipeline) — TODAY's real data, EXPANDED

Corpus: `insight_2026-06-23` (frozen copy of today's `insight_latest`, sha256 `695be2bfb01a0eae`,
contentHash `c0abdece9b8eb6d1`, 678 stories, fetchedAt 2026-06-23T13:21Z).
Oracle: **claude-opus-4-8, uncalibrated** → INDICATIVE, not certified.
Expansion over the 05-19 pass: + **recall/dedup-recall**, + bigger angle sample (30 stories), + today's data.

## Headline (real-data accuracy)
| Metric | Today (06-23) | Prev (05-19) | Note |
|---|---|---|---|
| Clustering precision (pairs) | **0.985** | 0.917 | inflated by the 55-pair Starmer cluster; cluster-level **9/10 clean** |
| **Egregious false merge** | **1** | 1 | France heatwave-drownings + ICC pregnancy-cricket (Hindi) — unrelated, cross-language |
| Angle accuracy | **0.267** (8/30) | 0.619 | far below the 0.55 alarm; the weak stage, worse today |
| **Dedup recall (near-identical)** | **0.419** (13/31 caught) | — (new) | **18 near-duplicate headline pairs both survive** |
| Ranking: minor in top-3 | **0 → PASS** | 0 → PASS | top-3 = major/major/notable |

## Three real findings (all reproducible)
1. **Angle classification is badly off on today's mix (≈27%).** Dominant error `base_report→official_response` (×6): the keyword classifier fires `official_response` on plain resignation/death/appointment reports (the whole Starmer cluster), and `regional_followup` on national incidents (Lucknow fire, Vizag blast). It also gave **different angles to byte-identical syndicated headlines** (Doval, NEET) — pure classifier inconsistency. Confirms A2.3 / the angle weakness, and shows the I008 angle-aware weak-tree fix is treating a real problem.
2. **Dedup leaks syndicated near-duplicates (recall ≈0.42).** 18 of 31 near-identical headline pairs (e.g., "SK Hynix overtakes Samsung", "Rupee snaps winning streak", "US notifies Apache sale", "Trump-backed Colombia election") survive as TWO separate stories — the user sees dupes. New finding, not in the audit.
3. **A real false merge — root cause CORRECTED.** Cluster #5 merges a French-heatwave story
   with a **Hindi** ICC-cricket story (unrelated). Investigation result: this is **NOT** an I010
   embedding issue (their embeddings have cosine **0**, zero shared dims — an earlier hypothesis,
   now disproven). The merge comes from **`applyClusterOverrides`'s "topic-cohesion" branch
   forcing `"SAME"`** on two ~0.08-similarity stories that are cross-source + within-36h +
   "category-compatible" — where compatibility is defeated by the pipeline **defaulting a missing
   `category` to `"news"`** (so unrelated uncategorized/foreign-language stories pass the guard).
   The exact firing is **build-sensitive in repro** and not yet deterministically pinned, so no
   code fix has been applied — a stable runtime repro + targeted guard + full cert/benchmark
   re-validation is required first (deliberately not a blind threshold change).

## Caveat
Single uncalibrated LLM oracle; angle numbers are sensitive to oracle strictness (I labeled "why/what-went-wrong/who-is" as background_context and plain reports as base_report). Direction is robust; certify with a human κ sample before gating. The frozen snapshot + `compare_oracle_vs_actual.mjs` make every number replayable.
