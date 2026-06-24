# Defect Tracking Matrix

- ID: P001
  Area: Planner classification
  Severity: High
  Owner file(s): src/intelligence/classification.js
  Detection: benchmark offline + planner_edgecases
  Exit gate: planner precision >= 0.85, no regression in smoke suite

- ID: P002
  Area: Market Data Completeness
  Severity: Medium
  Owner file(s): src/services/indianMarketService.js, public/data/market_snapshot.json
  Detection: test_market_snapshot_integrity.mjs
  Exit gate: Snapshot integrity test asserts more than just indices, checks commodities/currencies.

- ID: P003
  Area: Cascading Renders & Static Errors
  Severity: High
  Owner file(s): src/App.jsx, src/components/DebugConsole.jsx, src/pages/TechSocialPage.jsx
  Detection: npm run lint
  Exit gate: 0 errors, 0 warnings

- ID: P004
  Area: Date and Location Routing
  Severity: High
  Owner file(s): src/intelligence/dateAware.js, src/intelligence/locationAware.js
  Detection: benchmark online_input_100.json
  Exit gate: online Up Ahead precision >= 0.82, offline planner recall >= 0.75

- ID: P005
  Area: Static Host Truthfulness
  Severity: Medium
  Owner file(s): src/runtime/runtimeCapabilities.js, src/pages/MainPage.jsx
  Detection: Visual verification and smoke test
  Exit gate: No silent degradation, explicit feature status flags rendered

# ── Insight/Automation audit findings (Phase A4) ──

- ID: I001
  Area: Deploy pipeline — published site never refreshed by prefetch commits
  Severity: Critical
  Owner file(s): .github/workflows/news_prefetch.yml (16-18, 198-222), .github/workflows/deploy.yml (5-10)
  Detection: audit/evidence/A4.1-DEPLOY-01.yaml — GitHub Actions run history (deploy last ran 2026-06-12; data commits hourly) + live Pages snapshot fetch (deployed contentHash 92bee8cd0344 / fetchedAt 2026-06-12 vs repo 5a6820ccd64f / 2026-06-22)
  Root cause: news_prefetch.yml pushes data commits as github-actions[bot] via GITHUB_TOKEN; GITHUB_TOKEN pushes do not raise workflow-trigger events, so deploy.yml's `on: push` never fires for data commits. Site frozen >10 days. Header comment claiming auto-publish is wrong.
  Exit gate: deployed Pages newsdata refreshes within snapshot max-age of each prefetch commit; add post-deploy live-freshness probe cert (a deploy trigger such as PAT push / workflow_run / repository_dispatch is the remediation, tracked separately — no fix during audit)

- ID: I002
  Area: Main/Sections Hybrid mode empties on stale snapshot (no live fallback on static host)
  Severity: High
  Owner file(s): src/adapters/sectionsSnapshotFetcher.js (3-5, 210-272), src/services/rssAggregator.js (570-657), src/data/datasets/sectionsDataset.js (226-249)
  Detection: audit/evidence/A4.2-SECTIONS-02.yaml — selectPrefetchedSectionItems on deploy-aged snapshot returns 0 items/section (control: 15/section when fresh)
  Root cause: 12h snapshot / 36h item freshness gates discard all rows once the deployed snapshot ages out (driven by I001); allowWideFeedFetch=false blocks live RSS fallback → empty Main tab. Staleness is recorded internally but only an empty state reaches the user.
  Exit gate: when snapshot stale on static host, render labelled-stale rows OR an explicit "data delayed" state instead of silent empty; depends on I001 being fixed for the primary symptom

- ID: I003
  Area: news_prefetch scheduled cadence shortfall (OBSERVATION — needs full 14-day table)
  Severity: Low
  Owner file(s): .github/workflows/news_prefetch.yml (24-28)
  Detection: Actions run list shows ~3 runs on 2026-06-22 vs the ~18/day the cron implies (GitHub drops scheduled runs under load). Not yet quantified over 14 days per plan §A4.
  Exit gate: 14-day fetch reliability table produced; if cadence materially below target, document and ticket

# ── Determinism audit findings (Phase A0) ──

- ID: I004
  Area: Virtual-clock injection not fully plumbed (blocks B3 dated-snapshot replay)
  Severity: Low
  Owner file(s): src/insight/src/pipeline/temporalTier.ts (33), src/insight/src/cache/cacheManager.ts (34,69,101,148); partial param exists in src/insight/src/pipeline/normalize.ts (150,242)
  Detection: audit/evidence/A0.1-DET-01.yaml + A0.2-NONDETERMINISM-CATALOGUE.md — output is clock-coupled (real-clock hash 37616c2e99ccca69 ≠ frozen-clock hash d803a31bed6982eb on the same snapshot); a global Date.now shim was required to pin the clock because temporalTier/cacheManager read Date.now() directly.
  User impact: none in production (in-process runs are deterministic); blocks the B3 36h replay benchmark on dated snapshots until a clock is threaded through temporalTier + cacheManager.
  Exit gate: injected clock parameter threaded through temporalTier.computeEventAnchor and cacheManager age checks; B3 replay reproduces a dated snapshot without monkeypatching globals

# NOTE: Phase A0 itself PASSES (determinism established). See audit/evidence/A0.1-DET-01.yaml.
# A0 exit gate MET → A1, A2.x, A3, A4(remainder), A5 are unblocked.

# ── Contract & config audit findings (Phase A1) ──

- ID: I005
  Area: Audit plan quotes stale algorithm constants (doc drift, not code)
  Severity: Info
  Owner file(s): audit/INSIGHT_AUDIT_PLAN.md (§A2.2 thresholds, §A2.4 SAME_EVENT, §A1 cache TTL line)
  Detection: audit/evidence/A1.1-CONTRACT-01.yaml — code DEFAULT_CONFIG (0.96/0.985/0.88, CACHE_TTL 0/1/1.5/2/2.5/3h) matches project tuning docs (action_3_deep.md:450-451, INSIGHT_ANGLE_RCA), but the plan text quotes 0.92/0.85/0.75 and "-4h 2h/-12h 3h/-24h 4h".
  Exit gate: reconcile the plan's quoted constants to the shipped values during A6 (so future auditors test the right numbers)

- ID: I006
  Area: destination_contract_baseline.md is stale (reports fixed gaps as open)
  Severity: Low
  Owner file(s): reports/destination_contract_baseline.md (8,35,99-101); regenerator scripts/audit_destination_contracts.py
  Detection: audit/evidence/A1.1-CONTRACT-01.yaml — baseline claims collector 24h vs adapter 36h GAP, but fetch_sections_stories.py STORY_RETAIN_HOURS=36 already matches the adapter; baseline also warns quality_dashboard.json / insight_quality_report.json are unstaged, but news_prefetch.yml:205 stages both.
  Exit gate: regenerate destination_contract_baseline from current code; CI check that it is not stale

# NOTE: Phase A1 itself PASSES (code config/contract truthfulness sound). See audit/evidence/A1.1-CONTRACT-01.yaml.

# ── Stage-by-stage audit findings (Phase A2) ──

- ID: I007
  Area: scoreBreakdown is not a decomposition of finalParentScore (diagnostics truthfulness)
  Severity: Medium
  Owner file(s): src/insight/src/ranking/ranking.ts (360)
  Detection: audit/evidence/A2.x-STAGE-01.yaml (A2.5) — debug.scoreBreakdown stores raw component values + a finalParentScore key (13 entries); naive sum off by up to 5.983 from the score. The 12-weight model reproduces finalParentScore exactly (Δ 0.000), so the math is right but the breakdown misrepresents it.
  User impact: Ranked/score popups show a "breakdown" that does not add up to the displayed score → diagnostics mislead.
  Exit gate: A5 recomputes each displayed breakdown number; UI either shows weighted contributions that sum to the score, or labels raw signals unambiguously. Dedicated cert (B4 nDCG won't catch).

- ID: I008
  Area: Weak-tree flag is angle-blind (contradicts plan/RCA angle-diversity intent)
  Severity: Medium
  Owner file(s): src/insight/src/tree/treeBuilder.ts (isWeakTree), src/insight/src/pipeline/pipeline.ts (454)
  Detection: audit/evidence/A2.x-STAGE-01.yaml (A2.6) — isWeakTree = (<3 quality children: freshness≥0.45 & authority≥0.45); ignores angle count. cluster_453 (3 children, 1 angle) is non-weak. Plan §A2.6 documents weak = (<3 children OR <2 angles).
  User impact: Single-angle event trees are presented as healthy ("not weak") despite no angle diversity — the exact failure the Angle RCA targeted.
  Exit gate: reconcile weak-tree definition with documented intent (add angle-diversity term) OR update the contract; covered by B4 angle/diversity metric.

- ID: I009
  Area: parent.hiddenDuplicateIds empty — hidden-duplicate provenance not attached to parents (OBSERVATION)
  Severity: Low
  Owner file(s): src/insight/src/pipeline/pipeline.ts (452,573)
  Detection: audit/evidence/A2.x-STAGE-01.yaml (A2.2/A2.6) — 82 stories hidden by the pipeline, but all 10 top parents carry hiddenDuplicateIds=[] (hard-dups removed pre-cluster are never in clusterStoryIds, so the filter yields empty).
  Exit gate: confirm whether usefulVariantRescue/UI actually need per-parent hidden provenance (A2.6 recovery-path check); if so, attach it; else document that provenance lives only in result.hiddenIds.

- ID: I010
  Area: 15.3% of stories are OOV → zero embedding → embedding-invisible (F5-1 quantified)
  Severity: Medium
  Owner file(s): src/adapters/embeddingsAdapter.js (200-term fixed vocab), src/insight/src/dedup/dedup.ts (cosine)
  Detection: audit/evidence/A2.x-STAGE-01.yaml (A2.2) — 134/877 stories have all-zero embeddings on insight_2026-05-19 (contentHash 40f989d5da9c); cosine returns 0 for them, so they cluster only via title/other layers. Disproportionately hyperlocal (Trichy etc.).
  Exit gate: A3 F5-1 closure — measure OOV rate per locale + clustering degradation; expand vocab or add fallback embedding; B4 should track OOV rate.

# NOTE: Phase A2 PASSES with findings (each track has a ternary verdict). F5-5 VERIFIED-FIXED (cosine zero-vector guard). See audit/evidence/A2.x-STAGE-01.yaml.

# ── Known-findings closure (Phase A3) ──

- ID: I011
  Area: Breaking/new-event clusters may not surface promptly (F5-2)
  Severity: High
  Owner file(s): src/insight/src/ranking/ranking.ts (persistence/momentum weights), src/insight/src/pipeline/pipeline.ts (490-493 weak-tree demotion + TOP_PARENTS slice)
  Detection: audit/evidence/A3.1-CLOSURE-01.yaml (F5-2) — ranking weights persistence 0.20 + momentum 0.08 favor established events; a brand-new event forms a weak tree and is demoted below TOP_PARENTS. Mechanism confirmed by code+weights; surfacing latency UNVERIFIED (needs 2-snapshot incremental harness).
  User impact: genuine breaking news can be pushed out of the top-10 and not shown — bad for a news product.
  Exit gate: incremental two-snapshot harness measuring surfacing latency for an injected new event; add a freshness/breaking fast-path or latency cert (B4 cannot catch ordering of unseen events).

# NOTE: Phase A3 PASSES — all F5-x/RCA rows terminal (F5-5 VERIFIED-FIXED; F5-3/F5-6/F5-7 RISK-ACCEPTED; F5-1→I010, F5-2→I011, F5-4 Low; RCA-R1 VERIFIED). See audit/evidence/A3.1-CLOSURE-01.yaml.

# ══════════════════════════════════════════════════════════════════════════════
# UP AHEAD AUDIT (Phases U0–U6) — audit/UPAHEAD_AUDIT_PLAN.md
# ══════════════════════════════════════════════════════════════════════════════

# ── Determinism & clock injection (Phase U0) ──

- ID: I012
  Area: Static-host Up Ahead display projection has no injectable reference clock
  Severity: Low
  Owner file(s): src/services/upAheadService.js (40, 84, 135-139, 162-166, 418, 461, 602, 619), src/viewModels/useUpAheadPageViewModel.js (48, 133, 263, 284, 289, 302, 319, 343, 383-393)
  Detection: audit/evidence/U0.3-CLK-01.yaml + U0.3-CLOCK-CATALOGUE.md — the static path (items[] -> sanitizeUpAheadData -> getVisibleUpAheadProjection, the path most deployed users hit per MODE_MATRIX:29) reads new Date()/Date.now() at 13+ sites with no asOfDate parameter; the U0 harness had to pin the clock with vitest fake timers (global shim) to reproduce a dated projection. Contrast: the LIVE intelligence path threads asOfDate end-to-end and is replayable by injection (verified by execution, audit/evidence/U0.2-INJ-01.yaml).
  User impact: none in production (browser wall clock IS the intended reference; runs are deterministic given it — audit/evidence/U0.1-DET-01.yaml). Impact is on auditability/benchmark replay: the static projection cannot be replayed at a dated reference without controlling the global clock. Mirrors A0/I004, broader scope.
  Exit gate: thread an injected clock (asOfDate/now) through getStartOfTodayMs/generateWeeklyPlan/getVisibleUpAheadProjection age-caps + briefing/evidence, OR the UPAHEAD_BENCHMARK_PLAN replay adopts the documented global-clock shim. No fix during audit.

- ID: I013
  Area: Two divergent date-key conventions — static display files by UTC day, planner/dateAware by local day (U9-3 class)
  Severity: Medium
  Owner file(s): src/services/upAheadService.js (350-351 toISOString().slice(0,10)), src/utils/dateKey.js (11-15 toLocalDateKey), src/utils/plannerStorage.js (35, 65)
  Detection: audit/evidence/U0.4-TZ-01.yaml — same instant 2026-06-25T20:30:00Z (02:00 IST 2026-06-26) files under "2026-06-25" via sanitizeUpAheadData (static display) but "2026-06-26" via toLocalDateKey (planner) under TZ=Asia/Kolkata (keysAgree:false); under TZ=UTC both collapse to "2026-06-25". Reproducer: audit/evidence/u0_clockprobe.harness.test.mjs.
  Root cause: transformPythonItemsToDisplay derives eventDateKey = new Date(eventStartAt).toISOString().slice(0,10) (UTC, TZ-independent) while toLocalDateKey uses process-local getFullYear/Month/Date; they disagree by one day for events timed 00:00–05:29 IST. Contradicts MODE_MATRIX:56 ("Date keys … must stay on YYYY-MM-DD local convention").
  User impact: wrong-day placement for late-night/early-morning IST events (00:00–05:29 IST) — the timeline files them one day early and under a different key than the planner stores them, so the same event can land on two different days across the timeline vs the planner.
  Exit gate: single local-calendar date-key convention across display + planner; U2.3 (extraction) + U2.8 (planner keys) deliver the full verdict, U2.7 covers JS↔Python parity of the convention. No fix during audit.

# NOTE: Phase U0 itself PASSES (determinism established for a fixed (snapshot, clock); live-path asOfDate injection execution-verified). See audit/evidence/U0.1-DET-01.yaml + U0.2-INJ-01.yaml + audit/U0_DETERMINISM_SUMMARY.md.
# U0 EXIT GATE MET → U1, U2.x, U3, U4 are unblocked (U5 needs U2 evidence; U6 closes).

