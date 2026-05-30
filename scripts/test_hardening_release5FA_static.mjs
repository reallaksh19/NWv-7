import fs from 'node:fs';

const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exit(1);
};

const pass = (condition, message) => {
  if (!condition) fail(message);
};

const exists = path => fs.existsSync(path);
const read = path => fs.readFileSync(path, 'utf8');

[
  'src/data/slo/applyDatasetSlo.js',
  'src/components/DataStateBoundary.jsx',
  'src/components/data-state/index.js',
  'src/data/datasets/index.js',
  'src/data/datasets/newspaperDataset.js',
  'scripts/test_hardening_release5E_static.mjs',
].forEach(path => {
  pass(exists(path), `Missing Release 5E/5C prerequisite: ${path}`);
});

[
  'src/viewModels/useBuzzTabViewModel.js',
  'src/viewModels/useUpAheadTabViewModel.js',
  'src/viewModels/useNewspaperTabViewModel.js',
  'src/pages/NewspaperPage.jsx',
  'src/viewModels/useNewspaperTabViewModel.cert.test.js',
  'src/pages/NewspaperPage.release5FA.cert.test.jsx',
].forEach(path => {
  pass(exists(path), `Missing Release 5F-A file or prerequisite: ${path}`);
});

const registry = read('src/data/datasets/index.js');
const newspaperDataset = read('src/data/datasets/newspaperDataset.js');
const newspaperVm = read('src/viewModels/useNewspaperTabViewModel.js');
const newspaperPage = read('src/pages/NewspaperPage.jsx');
const techSocialPage = read('src/pages/TechSocialPage.jsx');
const upAheadPage = read('src/pages/UpAheadPage.jsx');

pass(techSocialPage.includes('useBuzzTabViewModel'), 'Release 5D prerequisite missing: TechSocialPage not migrated');
pass(upAheadPage.includes('useUpAheadTabViewModel'), 'Release 5E prerequisite missing: UpAheadPage not migrated');

pass(registry.includes('newspaper'), 'DATASET_LOADERS must register newspaper');
pass(newspaperDataset.includes('applyDatasetSlo'), 'newspaperDataset must be SLO-wrapped from Release 5C');
pass(
  newspaperDataset.includes("datasetId: 'newspaper'") || newspaperDataset.includes('datasetId: "newspaper"'),
  'newspaperDataset must emit datasetId newspaper'
);

pass(newspaperVm.includes("useDataset('newspaper')"), 'Newspaper ViewModel must use newspaper dataset');
pass(newspaperVm.includes('inferSourcesFromDatasetData'), 'Newspaper ViewModel must infer source sections from dataset data');
pass(newspaperVm.includes('normalizeSourceSections'), 'Newspaper ViewModel must support object-shaped source sections');
pass(newspaperVm.includes('getSectionSummary'), 'Newspaper ViewModel must own summary selection');
pass(newspaperVm.includes('getArticleTitle'), 'Newspaper ViewModel must own translated title selection');
pass(newspaperVm.includes('handleGenerateAll'), 'Newspaper ViewModel must own generate-all action');
pass(newspaperVm.includes('reloadDataset(force)'), 'Newspaper ViewModel must expose dataset reload');

pass(newspaperVm.includes('useMountedRef'), 'Newspaper ViewModel must use useMountedRef');
pass(newspaperVm.includes('mountedRef.current'), 'Newspaper ViewModel must guard async setState');
pass(newspaperVm.includes('MAX_AUTO_SUMMARY_ARTICLES'), 'Newspaper ViewModel must cap auto summary article count');
pass(newspaperVm.includes('MAX_TITLE_TRANSLATIONS'), 'Newspaper ViewModel must cap title translation count');
pass(newspaperVm.includes('autoSummaryAttemptedRef'), 'Newspaper ViewModel must prevent repeated automatic summary generation');
pass(newspaperVm.includes('hasGeminiKey'), 'Newspaper ViewModel must expose hasGeminiKey');

[
  'DATA_URL',
  'FALLBACK_FEEDS',
  'fetchFallbackRSS',
  'virtualPaperService',
  'proxyManager',
].forEach(token => {
  pass(!newspaperVm.includes(token), `Newspaper ViewModel must not contain page-fetch orchestration token ${token}`);
});

pass(newspaperPage.includes('useNewspaperTabViewModel'), 'NewspaperPage must use Newspaper ViewModel');
pass(newspaperPage.includes('DataStateBoundary'), 'NewspaperPage must use DataStateBoundary');
pass(newspaperPage.includes('NewspaperCard'), 'NewspaperPage must keep NewspaperCard rendering');
pass(newspaperPage.includes('Digest View'), 'NewspaperPage must preserve digest toggle');
pass(newspaperPage.includes('Generate All Summaries'), 'NewspaperPage must preserve summary generation control');
pass(newspaperPage.includes('Translate to English'), 'NewspaperPage must preserve translation control');
pass(newspaperPage.includes('!hasGeminiKey'), 'NewspaperPage must use hasGeminiKey');
pass(!newspaperPage.includes('sourceMeta?.geminiKey'), 'NewspaperPage must not check geminiKey on sourceMeta');

[
  "from '../context/SettingsContext'",
  'useSettings',
  'DATA_URL',
  'FALLBACK_FEEDS',
  'fetchData',
  'fetchFallbackRSS',
  'virtualPaperService',
  'proxyManager',
  'geminiService',
  'extractArticleText',
  'summarizeText',
].forEach(token => {
  pass(!newspaperPage.includes(token), `NewspaperPage must not contain ${token}`);
});

pass(
  newspaperPage.includes('errorMessage={error || "Failed to load today'),
  'NewspaperPage must pass dataset error into DataStateBoundary'
);

const forbiddenViewModels = [
  'src/viewModels/usePlannerTabViewModel.js',
  'src/viewModels/useFollowingTabViewModel.js',
  'src/viewModels/useInsightTabViewModel.js',
  'src/viewModels/useMainTabViewModel.js',
];

for (const file of forbiddenViewModels) {
  pass(!exists(file), `Release 5F-A must not add other tab ViewModel: ${file}`);
}

const forbiddenPages = [
  'src/pages/MainPage.jsx',
  'src/pages/MyPlannerPage.jsx',
  'src/pages/FollowingPage.jsx',
  'src/pages/InsightPage.jsx',
];

for (const file of forbiddenPages) {
  const content = read(file);

  pass(!content.includes('useDataset'), `${file} must not be migrated in Release 5F-A`);
  pass(!content.includes('DataStateBoundary'), `${file} must not use DataStateBoundary in Release 5F-A`);
  pass(!content.includes('useMainTabViewModel'), `${file} must not use Main VM in Release 5F-A`);
  pass(!content.includes('useInsightTabViewModel'), `${file} must not use Insight VM in Release 5F-A`);
}

const pkg = JSON.parse(read('package.json'));

pass(
  pkg.scripts?.['test:hardening:release5FA'] === 'node scripts/test_hardening_release5FA_static.mjs',
  'package.json missing test:hardening:release5FA script'
);

pass(
  typeof pkg.scripts?.['test:newspaper-migration'] === 'string',
  'package.json missing test:newspaper-migration script'
);

[
  'useNewspaperTabViewModel.cert.test.js',
  'NewspaperPage.release5FA.cert.test.jsx',
].forEach(testFile => {
  pass(
    pkg.scripts['test:newspaper-migration'].includes(testFile),
    `package.json test:newspaper-migration missing ${testFile}`
  );
});

[
  'date-fns',
  'lodash',
  'zod',
].forEach(dep => {
  pass(!pkg.dependencies?.[dep], `Release 5F-A must not add dependency ${dep}`);
  pass(!pkg.devDependencies?.[dep], `Release 5F-A must not add devDependency ${dep}`);
});

const workflowDir = '.github/workflows';

if (exists(workflowDir)) {
  const workflowFiles = fs.readdirSync(workflowDir)
    .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

  for (const file of workflowFiles) {
    const content = read(`${workflowDir}/${file}`);
    pass(!content.includes('release5FA'), `Release 5F-A must not modify workflows: ${file}`);
  }
}

console.log('PASS: Release 5F-A corrected Newspaper migration gates');
