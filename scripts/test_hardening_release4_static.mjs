import fs from 'node:fs';

const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exit(1);
};

const pass = (condition, message) => {
  if (!condition) fail(message);
};

const read = path => fs.readFileSync(path, 'utf8');
const exists = path => fs.existsSync(path);

// ── Release 3 prerequisite gate ───────────────────────────────────────────────
[
  'src/data/loadWithPolicy.js',
  'src/data/healthScore.js',
  'src/data/slo/marketSlo.js',
  'src/data/slo/qualityDashboardSlo.js',
  'src/data/slo/sourceHealthSlo.js',
  'src/data/datasets/marketDataset.js',
  'src/data/datasets/qualityDashboardDataset.js',
  'src/data/datasets/sourceHealthDataset.js',
  'src/data/orchestrator/useDataset.js',
  'src/data/diagnosticsStore.js',
].forEach(path => {
  pass(exists(path), `Missing Release 3 prerequisite: ${path}`);
});

// ── Release 4 files must exist ────────────────────────────────────────────────
[
  'src/data/datasets/weatherDataset.js',
  'src/viewModels/useMarketTabViewModel.js',
  'src/viewModels/useWeatherTabViewModel.js',
  'src/viewModels/useTopicDetailViewModel.js',
  'src/components/DataHealthPanel.jsx',
  'src/pages/DataHealthPage.jsx',
].forEach(path => {
  pass(exists(path), `Missing Release 4 file: ${path}`);
});

const useDataset = read('src/data/orchestrator/useDataset.js');
const registry = read('src/data/datasets/index.js');
const weatherDataset = read('src/data/datasets/weatherDataset.js');
const marketDataset = read('src/data/datasets/marketDataset.js');
const weatherVm = read('src/viewModels/useWeatherTabViewModel.js');
const marketPage = read('src/pages/MarketPage.jsx');
const weatherPage = read('src/pages/WeatherPage.jsx');
const topicDetail = read('src/pages/TopicDetail.jsx');
const panel = read('src/components/DataHealthPanel.jsx');
const app = read('src/App.jsx');
const debugConsole = read('src/components/DebugConsole.jsx');

// ── useDataset must expose listDatasetCache ───────────────────────────────────
pass(useDataset.includes('export function listDatasetCache'), 'useDataset must expose production listDatasetCache() for DataHealthPanel');

// ── DATASET_LOADERS must include weather (4 entries: market, qualityDashboard, sourceHealth, weather) ──
pass(registry.includes('weather'), 'DATASET_LOADERS missing weather');
['insight', 'sections', 'upAhead', 'buzz', 'planner', 'newspaper'].forEach(name => {
  pass(!registry.includes(`${name}:`), `Release 4 must not register ${name} loader yet`);
});

// ── weatherDataset constraints ────────────────────────────────────────────────
pass(!weatherDataset.includes('useWeather'), 'weatherDataset must not import/use useWeather');
pass(!weatherDataset.includes('WeatherContext'), 'weatherDataset must not import WeatherContext');
pass(!weatherDataset.includes('WeatherProvider'), 'weatherDataset must not import WeatherProvider');
pass(weatherDataset.includes('fetchWeather'), 'weatherDataset must use fetchWeather');
pass(weatherDataset.includes('getConfiguredWeatherCities'), 'weatherDataset must use configured cities');
pass(weatherDataset.includes('Array.isArray(configuredCities)'), 'weatherDataset must guard configured cities array');

// ── marketDataset must use SLO ────────────────────────────────────────────────
pass(marketDataset.includes('evaluateMarketSlo'), 'Corrected Release 3 marketDataset must use evaluateMarketSlo');
pass(marketDataset.includes('makeEnvelope'), 'Corrected Release 3 marketDataset must return makeEnvelope');

// ── Weather ViewModel constraints ─────────────────────────────────────────────
pass(weatherVm.includes('hasWeatherData'), 'Weather ViewModel must expose hasWeatherData');
pass(
  !weatherVm.includes("weatherData = envelope?.data?.weatherData || {}"),
  'Weather ViewModel must not default weatherData to {} because it hides loading state'
);
pass(
  weatherVm.includes("weatherData = envelope?.data?.weatherData || null"),
  'Weather ViewModel must default weatherData to null'
);

// ── MarketPage migration ──────────────────────────────────────────────────────
pass(marketPage.includes('useMarketTabViewModel'), 'MarketPage must use market ViewModel');
pass(!marketPage.includes("from '../context/MarketContext'"), 'MarketPage must not import useMarket');
pass(!marketPage.includes('ensureBoot'), 'MarketPage must not call ensureBoot after migration');

if (marketPage.includes('getMarketToneClass(')) {
  pass(marketPage.includes('function getMarketToneClass'), 'getMarketToneClass used but not defined');
}

if (marketPage.includes('getFloat(')) {
  pass(marketPage.includes('function getFloat'), 'getFloat used but not defined');
}

if (marketPage.includes('hasUsableSectionData(')) {
  pass(marketPage.includes('function hasUsableSectionData'), 'hasUsableSectionData used but not defined');
}

// ── WeatherPage migration ─────────────────────────────────────────────────────
pass(weatherPage.includes('useWeatherTabViewModel'), 'WeatherPage must use weather ViewModel');
pass(!weatherPage.includes("from '../context/WeatherContext'"), 'WeatherPage must not import useWeather');
pass(!weatherPage.includes('ensureBoot'), 'WeatherPage must not call ensureBoot after migration');
pass(!weatherPage.includes('localStorage'), 'WeatherPage active city storage must move to ViewModel');
pass(weatherPage.includes('hasWeatherData'), 'WeatherPage must branch on hasWeatherData');

// ── TopicDetail migration ─────────────────────────────────────────────────────
pass(topicDetail.includes('useTopicDetailViewModel'), 'TopicDetail must use topic ViewModel');
pass(!topicDetail.includes("from '../utils/withTimeout"), 'TopicDetail should not directly use withTimeout after VM migration');
pass(!topicDetail.includes("from '../hooks/useMountedRef"), 'TopicDetail should not directly use useMountedRef after VM migration');

// ── DataHealthPanel constraints ───────────────────────────────────────────────
pass(!panel.includes('__getDatasetCacheForTest'), 'DataHealthPanel must not use test-only cache export');
pass(panel.includes('listDatasetCache'), 'DataHealthPanel must use production listDatasetCache()');
pass(panel.includes("typeof navigator !== 'undefined'"), 'DataHealthPanel must guard navigator access');
pass(panel.includes("typeof document !== 'undefined'"), 'DataHealthPanel must guard document access');
pass(panel.includes("typeof Blob !== 'undefined'"), 'DataHealthPanel must guard Blob access');
pass(panel.includes("typeof URL !== 'undefined'"), 'DataHealthPanel must guard URL access');

// ── App.jsx route ─────────────────────────────────────────────────────────────
pass(app.includes('path="/data-health"'), 'App missing /data-health route');
pass(app.includes('label="Data Health"'), 'Data Health route must use ErrorBoundary label');

// ── DebugConsole lifecycle fixes ──────────────────────────────────────────────
pass(
  debugConsole.includes("removeEventListener('unhandledrejection'") ||
  debugConsole.includes('removeEventListener("unhandledrejection"'),
  'DebugConsole must remove unhandledrejection listener'
);
// The interception effect must use empty deps []. The ref-sync effect IS allowed to use [isOpen].
// We check that the interception closure has empty deps by verifying isOpenRef is used AND
// the file does NOT have the interception effect (console.log wrapper) depend on isOpen —
// detect by ensuring the empty-dep pattern exists alongside isOpenRef.
pass(
  debugConsole.includes('}, []); // Empty deps') ||
  (debugConsole.includes('isOpenRef.current = isOpen') && debugConsole.includes('}, [])')),
  'DebugConsole interception effect must use empty deps []'
);
pass(debugConsole.includes('const isOpenRef = useRef(isOpen)'), 'DebugConsole must use isOpenRef');

// ── No forbidden tab migrations ───────────────────────────────────────────────
const forbiddenPages = [
  'src/pages/MainPage.jsx',
  'src/pages/InsightPage.jsx',
  'src/pages/TechSocialPage.jsx',
  'src/pages/UpAheadPage.jsx',
  'src/pages/NewspaperPage.jsx',
  'src/pages/MyPlannerPage.jsx',
  'src/pages/FollowingPage.jsx',
];

for (const file of forbiddenPages) {
  if (!exists(file)) continue;
  const content = read(file);
  pass(!content.includes('useDataset('), `${file} must not import useDataset in Release 4`);
  pass(!content.includes('useMainTabViewModel'), `${file} must not migrate Main VM in Release 4`);
  pass(!content.includes('useInsightTabViewModel'), `${file} must not migrate Insight VM in Release 4`);
  pass(!content.includes('useBuzzTabViewModel'), `${file} must not migrate Buzz VM in Release 4`);
  pass(!content.includes('useUpAheadTabViewModel'), `${file} must not migrate UpAhead VM in Release 4`);
}

// ── Cert test files exist ─────────────────────────────────────────────────────
[
  'src/data/datasets/weatherDataset.cert.test.js',
  'src/components/DataHealthPanel.cert.test.jsx',
].forEach(path => {
  pass(exists(path), `Missing Release 4 cert test: ${path}`);
});

console.log('PASS: Release 4 corrected first ViewModel + DataHealth gates');
