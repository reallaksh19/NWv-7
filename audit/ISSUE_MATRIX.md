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

