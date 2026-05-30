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
  'src/data/slo/index.js',
  'src/data/slo/sectionsSlo.js',
  'src/data/slo/buzzSlo.js',
  'src/data/slo/upAheadSlo.js',
  'src/data/slo/newspaperSlo.js',
  'src/data/slo/plannerSlo.js',
  'src/data/slo/followingSlo.js',
  'src/data/slo/insightSlo.js',
  'src/data/slo/mainSlo.js',
  'scripts/test_hardening_release5B_static.mjs',
].forEach(path => {
  pass(exists(path), `Missing corrected Release 5B prerequisite: ${path}`);
});

[
  'src/data/slo/applyDatasetSlo.js',
  'src/components/DataStateBoundary.jsx',
  'src/components/data-state/DataFreshnessBadge.jsx',
  'src/components/data-state/DataSourceBadge.jsx',
  'src/components/data-state/DataSloBadge.jsx',
  'src/components/data-state/DataStateBanner.jsx',
  'src/components/data-state/DataRetrySection.jsx',
  'src/components/data-state/DataSkeleton.jsx',
  'src/components/data-state/DataStateMeta.jsx',
  'src/components/data-state/index.js',
].forEach(path => {
  pass(exists(path), `Missing Release 5C file: ${path}`);
});

const applySlo = read('src/data/slo/applyDatasetSlo.js');

pass(applySlo.includes('getDatasetSloEvaluator'), 'applyDatasetSlo must use SLO registry');
pass(applySlo.includes('makeEnvelope'), 'applyDatasetSlo must return canonical envelope');
pass(applySlo.includes('slo.required === true'), 'applyDatasetSlo must respect required SLO failures');
pass(applySlo.includes('.slo_evaluated'), 'applyDatasetSlo must add evaluated diagnostics');
pass(applySlo.includes('try') && applySlo.includes('catch'), 'applyDatasetSlo must guard evaluator errors');
pass(applySlo.includes('slo_evaluation_failed'), 'applyDatasetSlo must convert evaluator errors into failed envelopes');

[
  'sectionsDataset',
  'buzzDataset',
  'upAheadDataset',
  'newspaperDataset',
  'plannerDataset',
  'followingDataset',
  'insightDataset',
  'mainDataset',
].forEach(name => {
  const path = `src/data/datasets/${name}.js`;
  const content = read(path);

  pass(content.includes('applyDatasetSlo'), `${name} must import/use applyDatasetSlo`);
  pass(content.includes('makeEnvelope'), `${name} must still create canonical envelopes`);

  const usesAppliedEnvelope =
    /return\s+applyDatasetSlo\s*\(/.test(content) ||
    /applyDatasetSlo\s*\(\s*makeEnvelope\s*\(/.test(content);

  pass(usesAppliedEnvelope, `${name} must return SLO-applied envelope`);
});

[
  'marketDataset',
  'qualityDashboardDataset',
  'sourceHealthDataset',
  'weatherDataset',
].forEach(name => {
  const path = `src/data/datasets/${name}.js`;

  if (exists(path)) {
    const content = read(path);
    pass(!content.includes('../slo/applyDatasetSlo'), `${name} must not be wrapped in Release 5C`);
  }
});

const boundary = read('src/components/DataStateBoundary.jsx');

pass(boundary.includes('export default function DataStateBoundary'), 'DataStateBoundary missing default export');
pass(boundary.includes('getBoundaryState'), 'DataStateBoundary missing state helper');
pass(boundary.includes('hasRenderableValue'), 'DataStateBoundary must use recursive renderability helper');
pass(boundary.includes("return 'loading'"), 'DataStateBoundary missing loading state');
pass(boundary.includes("return 'error'"), 'DataStateBoundary missing error state');
pass(boundary.includes("return 'empty'"), 'DataStateBoundary missing empty state');
pass(boundary.includes("return 'degraded'"), 'DataStateBoundary missing degraded state');
pass(boundary.includes("return 'refreshing'"), 'DataStateBoundary missing refreshing state');
pass(boundary.includes("return 'ready'"), 'DataStateBoundary missing ready state');
pass(boundary.includes("typeof children === 'function'"), 'DataStateBoundary must support render prop children');

const meta = read('src/components/data-state/DataStateMeta.jsx');
pass(meta.includes('function asArray'), 'DataStateMeta must guard warning arrays');
pass(meta.includes('asArray(envelope?.validation?.warnings)'), 'DataStateMeta must guard validation warnings');
pass(meta.includes('asArray(envelope?.slo?.warnings)'), 'DataStateMeta must guard SLO warnings');

const forbiddenPages = [
  'src/pages/MainPage.jsx',
  'src/pages/TechSocialPage.jsx',
  'src/pages/UpAheadPage.jsx',
  'src/pages/NewspaperPage.jsx',
  'src/pages/MyPlannerPage.jsx',
  'src/pages/FollowingPage.jsx',
  'src/pages/InsightPage.jsx',
];

for (const file of forbiddenPages) {
  const content = read(file);

  pass(!content.includes('useDataset'), `${file} must not be migrated in Release 5C`);
  pass(!content.includes('DataStateBoundary'), `${file} must not use DataStateBoundary until migration phase`);
  pass(!content.includes('useMainTabViewModel'), `${file} must not use Main VM in Release 5C`);
  pass(!content.includes('useInsightTabViewModel'), `${file} must not use Insight VM in Release 5C`);
}

const forbiddenViewModels = [
  'src/viewModels/useBuzzTabViewModel.js',
  'src/viewModels/useUpAheadTabViewModel.js',
  'src/viewModels/useNewspaperTabViewModel.js',
  'src/viewModels/usePlannerTabViewModel.js',
  'src/viewModels/useFollowingTabViewModel.js',
  'src/viewModels/useInsightTabViewModel.js',
  'src/viewModels/useMainTabViewModel.js',
];

for (const file of forbiddenViewModels) {
  pass(!exists(file), `Release 5C must not add tab ViewModel: ${file}`);
}

const pkg = JSON.parse(read('package.json'));

pass(
  pkg.scripts?.['test:hardening:release5C'] === 'node scripts/test_hardening_release5C_static.mjs',
  'package.json missing test:hardening:release5C script'
);

pass(
  typeof pkg.scripts?.['test:data-state-components'] === 'string',
  'package.json missing test:data-state-components script'
);

pass(
  typeof pkg.scripts?.['test:slo-application'] === 'string',
  'package.json missing test:slo-application script'
);

[
  'date-fns',
  'lodash',
  'zod',
].forEach(dep => {
  pass(!pkg.dependencies?.[dep], `Release 5C must not add dependency ${dep}`);
  pass(!pkg.devDependencies?.[dep], `Release 5C must not add devDependency ${dep}`);
});

const workflowDir = '.github/workflows';

if (exists(workflowDir)) {
  const workflowFiles = fs.readdirSync(workflowDir)
    .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

  for (const file of workflowFiles) {
    const content = read(`${workflowDir}/${file}`);
    pass(!content.includes('release5C'), `Release 5C must not modify workflows: ${file}`);
  }
}

console.log('PASS: Release 5C corrected DataStateBoundary + SLO integration gates');
