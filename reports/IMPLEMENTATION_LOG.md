# Implementation Log

## A-13 / W8-1 - Weather Snapshot Automation And Freshness

- Branch: `fix/A-13-W8-1-weather-freshness`
- Commit: `fix(A-13 W8-1): guard stale weather snapshots` (this finding commit)
- Added tests:
  - `src/services/weatherSnapshotFreshness.cert.test.js`
  - `scripts/test_public_snapshot_freshness_static.mjs`
- Added automation:
  - `.github/workflows/weather_refresh.yml`
  - `scripts/weather_snapshot_worker.py`
- Local verification:
  - Red before fix: `npm run test:unit -- src/services/weatherSnapshotFreshness.cert.test.js` rejected stale snapshots only after the guard was added.
  - Red before refresh: `npm run test:snapshot-freshness` failed on `weather_snapshot.json.chennai` at ~9935 h old with a 48 h limit.
  - Pass: `python scripts/weather_snapshot_worker.py`
  - Pass: `npm run test:snapshot-freshness`
  - Pass: `npm run test:unit -- src/services/weatherSnapshotFreshness.cert.test.js`
  - Pass: `npm run test:weather-integration-hardening`
  - Pass: `npm run test:weather-signal-precision`
  - Pass: `npm run test:weather-weekly-planning`
  - Pass: `python -m py_compile scripts/weather_snapshot_worker.py`
  - Pass: `npm run build`
  - Pass: `npm run test:unit` (123 files / 760 tests)
  - Pass: touched-file lint via `npx eslint src/services/weatherService.js src/services/weatherSnapshotFreshness.cert.test.js scripts/test_public_snapshot_freshness_static.mjs`
- Existing failures observed:
  - `npm run lint` still reports the repo baseline: 24 errors / 15 warnings.
  - `npm run test:weather-trust` fails because `WeatherPage.jsx` lacks the stale static token `auditWeatherTabQuality`.
  - `npm run test:weather-location-customization` fails because `WeatherPage.jsx` lacks the stale static token `getConfiguredWeatherCities`.

## B-1 - Planner Per-Item Calendar Export

- Branch: `fix/B-1-planner-calendar-export`
- Commit: `fix(B-1): wire planner item calendar export` (this finding commit)
- Added test:
  - `src/pages/MyPlannerPageCalendarExport.cert.test.jsx`
- Local verification:
  - Red before fix: `npm run test:unit -- src/pages/MyPlannerPageCalendarExport.cert.test.jsx` failed after clicking `Add to Calendar`; React raised `ReferenceError: exportPlannerItem is not defined`.
  - Red before fix: `npx eslint src/pages/MyPlannerPage.jsx src/pages/MyPlannerPageCalendarExport.cert.test.jsx` reported `no-undef` for `exportPlannerItem` and unused destructuring at the ViewModel binding.
  - Pass: `npm run test:unit -- src/pages/MyPlannerPageCalendarExport.cert.test.jsx`
  - Pass: touched-file lint via `npx eslint src/pages/MyPlannerPage.jsx src/pages/MyPlannerPageCalendarExport.cert.test.jsx`
  - Pass: `npm run build`
  - Pass: `npm run test:unit` (124 files / 761 tests)
- Existing failures observed:
  - `npm run lint` still fails, now at 22 errors / 15 warnings. The B-1 `MyPlannerPage.jsx` `no-undef` and unused binding errors are gone; remaining errors are unrelated baseline items.

## B-3 - UpAhead Fallback Reload Wiring

- Branch: `fix/B-3-upahead-fallback-reload`
- Commit: `fix(B-3): simplify upahead fallback reload wiring` (this finding commit)
- Added test:
  - `src/pages/UpAheadPageFallbackReload.cert.test.jsx`
- Updated stale migration cert:
  - `src/pages/UpAheadPage.release5E.cert.test.jsx`
- Local verification:
  - Red before fix: `npm run test:unit -- src/pages/UpAheadPageFallbackReload.cert.test.jsx` failed because `UpAheadPage.jsx` still imported `useUpAheadTabViewModel` and kept the dead fallback wrapper.
  - Red before fix: `npx eslint src/pages/UpAheadPage.jsx src/pages/UpAheadPageFallbackReload.cert.test.jsx` reported unused `useUpAheadTabViewModel` and `no-unreachable`.
  - Pass: `npm run test:unit -- src/pages/UpAheadPageFallbackReload.cert.test.jsx src/pages/UpAheadPage.release5E.cert.test.jsx src/pages/UpAheadPage.release6R.cert.test.jsx`
  - Pass: touched-file lint via `npx eslint src/pages/UpAheadPage.jsx src/pages/UpAheadPageFallbackReload.cert.test.jsx src/pages/UpAheadPage.release5E.cert.test.jsx src/pages/UpAheadPage.release6R.cert.test.jsx`
  - Pass: `npm run build`
  - Pass: `npm run test:unit` (125 files / 762 tests)
- Existing failures observed:
  - `npm run lint` still fails, now at 20 errors / 15 warnings. The B-3 `UpAheadPage.jsx` unused import and unreachable-code errors are gone; remaining errors are unrelated baseline items.

## B-2 - Settings Ranking Hook Boundaries

- Branch: `fix/B-2-settings-hooks`
- Commit: `fix(B-2): move settings ranking hooks into components` (this finding commit)
- Added test:
  - `src/pages/SettingsPageHooks.cert.test.jsx`
- Local verification:
  - Red before fix: `npm run test:unit -- src/pages/SettingsPageHooks.cert.test.jsx` failed because `MainRankingContent` and `BuzzRankingContent` did not exist and the stateful sections were nested render functions.
  - Red before fix: `npx eslint src/pages/SettingsPage.jsx src/pages/SettingsPageHooks.cert.test.jsx` reported two `react-hooks/rules-of-hooks` errors in `renderMainContent` and `renderBuzzContent`.
  - Pass: `npm run test:unit -- src/pages/SettingsPageHooks.cert.test.jsx src/pages/SettingsPage.release6M.cert.test.jsx`
  - Pass: touched-file lint via `npx eslint src/pages/SettingsPage.jsx src/pages/SettingsPageHooks.cert.test.jsx src/pages/SettingsPage.release6M.cert.test.jsx`
  - Pass: `npm run build`
  - Pass: `npm run test:unit` (126 files / 763 tests)
- Existing failures observed:
  - `npm run lint` still fails, now at 18 errors / 15 warnings. The B-2 Settings `rules-of-hooks` errors are gone; remaining errors are unrelated baseline items.

## Lint Gate Cleanup - Unused Bindings

- Branch: `chore/lint-cleanup-unused-bindings`
- Commit: `chore(lint): remove unused cleanup blockers` (this cleanup commit)
- Scope:
  - Removed stale blanket lint disable from `src/components/ErrorBoundary.jsx`.
  - Removed unused test imports/destructures from `src/data/loadWithPolicy.cert.test.js` and `src/pages/WeatherPage.release6K.cert.test.jsx`.
  - Removed unused `_force` parameter from `src/viewModels/useNewspaperPageViewModel.js`.
  - Kept `QuickMarket`'s prop-driven refresh contract live by wiring `onRefreshMarket` to a compact header action.
- Local verification:
  - Red before cleanup: `npm run lint` failed at 18 errors / 15 warnings after the B-2 commit.
  - Pass: touched-file lint via `npx.cmd eslint src/components/QuickMarket.jsx src/components/ErrorBoundary.jsx src/data/loadWithPolicy.cert.test.js src/pages/WeatherPage.release6K.cert.test.jsx src/viewModels/useNewspaperPageViewModel.js`
  - Pass: `npm.cmd run test:unit -- src/pages/MarketPage.release6J.cert.test.jsx src/data/loadWithPolicy.cert.test.js src/pages/WeatherPage.release6K.cert.test.jsx` (3 files / 27 tests)
  - Pass: `npm.cmd run build`
  - Pass: `npm.cmd run test:unit` (126 files / 763 tests)
  - Pass: `git diff --check`
- Existing failures observed:
  - `npm.cmd run lint` still fails, now at 11 errors / 14 warnings.
  - Remaining errors are unrelated `react-refresh/only-export-components` export-shape issues and `react-hooks/set-state-in-effect` findings in `useDataset`, `useMyPlannerPageViewModel`, and `useWeatherTabViewModel`.
