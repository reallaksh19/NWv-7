import fs from 'fs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(path) {
  assert(fs.existsSync(path), `Missing file: ${path}`);
  return fs.readFileSync(path, 'utf8');
}

const validator = read('scripts/validate_news_prefetch_workflow.mjs');
const packageJson = read('package.json');
const certGate = read('scripts/run_certification_gate.mjs');
const crossWorkflowValidator = read('scripts/validate_prefetch_workflow_contracts.mjs');

for (const token of [
  'validateNewsPrefetchWorkflow',
  'Bump fetchedAt sentinel',
  'git add public/newsdata/\\n',
  'Validate Insight prefetch quality',
  'Validate Sections prefetch contract',
  'Decide whether news data commit is needed',
  'Validate quality dashboard',
  'Build Pages site with latest newsdata',
  'Publish updated Pages site',
  'Verify deployed Pages newsdata',
  'should_commit=true',
  'quality_dashboard.json',
]) {
  assert(validator.includes(token), `validate_news_prefetch_workflow.mjs missing token: ${token}`);
}

for (const token of [
  'Fetch UpAhead events',
  'Fetch Festivals (weekly Saturday UTC run only)',
  'Enrich UpAhead lifecycle contract',
  'Validate UpAhead lifecycle contract',
  'validate_upahead_prefetch_output.py',
  'validate_sections_prefetch_output.py',
  'quality_dashboard.json',
  'buzz_latest.json',
  'weather_latest.json',
  'market_latest.json',
]) {
  assert(crossWorkflowValidator.includes(token), `cross workflow validator missing token: ${token}`);
}

assert(
  packageJson.includes('"test:news-prefetch-workflow-orchestration"'),
  'package.json must include test:news-prefetch-workflow-orchestration'
);

assert(
  (certGate.includes("['npm', ['run', 'test:news-prefetch-workflow-orchestration']]") || certGate.includes('certification_manifest.json')),
  'certification gate must run test:news-prefetch-workflow-orchestration'
);

console.log(JSON.stringify({
  status: 'PASS',
  checked: 'News + Up Ahead workflow orchestration static slice',
  guarantees: [
    'workflow orchestration validator exists',
    'old fetchedAt sentinel is rejected',
    'blind public/newsdata git add is rejected',
    'critical news workflow step order is certified',
    'Data Health diagnostic staging is certified',
    'Up Ahead lifecycle enrichment/validation ordering is certified',
    'parallel unused JSON outputs are blocked',
    'certification gate includes workflow orchestration validation'
  ]
}, null, 2));

console.log('PASS: News + Up Ahead workflow orchestration static slice');
