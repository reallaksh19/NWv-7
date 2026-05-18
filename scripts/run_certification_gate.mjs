import { spawnSync } from 'node:child_process';

const commands = [
  ['npm', ['run', 'lint']],
  ['npm', ['run', 'test:lint-hotfix']],
  ['npm', ['run', 'test:quick-weather-pro']],
  ['npm', ['run', 'test:bottom-nav']],
  ['npm', ['run', 'test:market-trust']],
  ['npm', ['run', 'test:weather-trust']],
  ['npm', ['run', 'test:following']],
  ['npm', ['run', 'test:desktop-polish']],
  ['npm', ['run', 'test:insight-foundation']],
  ['npm', ['run', 'test:insight-audit']],
  ['npm', ['run', 'test:insight-angle-display']],
  ['npm', ['run', 'test:insight-ranking-diagnostics']],
  ['npm', ['run', 'test:insight-behavior-plan']],
  ['npm', ['run', 'test:insight-tree-tuning']],
  ['npm', ['run', 'test:insight-duplicate-diagnostics']],
  ['npm', ['run', 'test:insight-ranking-reason']],
  ['npm', ['run', 'test:insight-diversity-tuning']],
  ['npm', ['run', 'test:insight-top-story-anchor']],
  ['npm', ['run', 'test:insight-useful-variant-rescue']],
  ['npm', ['run', 'test:insight-angle-classifier-enrichment']],
  ['npm', ['run', 'test:insight-cluster-anchor']],
  ['npm', ['run', 'test:insight-24h-concept']],
  ['npm', ['run', 'test:insight-behavior-evidence']],
  ['npm', ['run', 'test:upahead-evidence']],
  ['npm', ['run', 'test:upahead-briefing']],
  ['npm', ['run', 'test:planner-evidence']],
  ['npm', ['run', 'test:planner-view-model']],
  ['npm', ['run', 'test:planner-bulk-actions']],
  ['npm', ['run', 'test:calendar-export-quality']],
  ['npm', ['run', 'test:planner-item-inspector']],
  ['npm', ['run', 'test:planner-agenda-export']],
  ['npm', ['run', 'test:unit']],
  ['npm', ['run', 'build']]
];

const results = [];

for (const [cmd, args] of commands) {
  const label = `${cmd} ${args.join(' ')}`;
  console.log(`\n\nCERTIFICATION STEP: ${label}`);
  console.log('='.repeat(80));

  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  const ok = result.status === 0;

  results.push({
    command: label,
    status: ok ? 'PASS' : 'FAIL',
    exitCode: result.status
  });

  if (!ok) {
    console.error(`\nCERTIFICATION FAILED: ${label}`);
    console.error(JSON.stringify({ status: 'FAIL', failedCommand: label, results }, null, 2));
    process.exit(result.status || 1);
  }
}

console.log('\n\nCERTIFICATION RESULT');
console.log('='.repeat(80));
console.log(JSON.stringify({
  status: 'PASS',
  checked: 'NWv-7 full certification gate',
  results
}, null, 2));

console.log('PASS: Full certification gate');