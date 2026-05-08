import { execSync } from 'child_process';

const tests = [
    'scripts/test_insight_contract_schemas.mjs',
    'scripts/test_insight_history_integrity.mjs',
    'scripts/test_insight_digest_integrity.mjs'
];

let failed = false;

for (const script of tests) {
    try {
        console.log(`Running ${script}...`);
        execSync(`node ${script}`, { stdio: 'inherit' });
    } catch (e) {
        console.error(`FAILED: ${script}`);
        failed = true;
    }
}

try {
    execSync('npm run benchmark:insight', { stdio: 'inherit' });
} catch (e) {
    failed = true;
}

if (failed) {
    process.exit(1);
} else {
    console.log("ALL INSIGHT TESTS PASS.");
}
