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
3. **🚨 Likely regression from my own I010 fix.** Cluster #5 merges a French-heatwave story with a **Hindi** ICC-cricket story — unrelated. Pre-I010 the Hindi story had an all-zero embedding (cosine 0 → could not merge). The I010 feature-hash fallback gives it a non-zero vector that appears to have **collided** with an unrelated story. The benchmark caught a plausible side-effect of the remediation: the OOV fallback needs a guard (cap its magnitude / block cross-language merges) so it doesn't manufacture false merges.

## Caveat
Single uncalibrated LLM oracle; angle numbers are sensitive to oracle strictness (I labeled "why/what-went-wrong/who-is" as background_context and plain reports as base_report). Direction is robust; certify with a human κ sample before gating. The frozen snapshot + `compare_oracle_vs_actual.mjs` make every number replayable.
