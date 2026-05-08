import { execSync } from 'child_process';

const benchmarks = [
    'benchmarks/insight/runWave4DedupBenchmark.mjs',
    'benchmarks/insight/runWave5EventClusterBenchmark.mjs',
    'benchmarks/insight/runWave6AnchorBenchmark.mjs',
    'benchmarks/insight/runWave7AngleBenchmark.mjs',
    'benchmarks/insight/runWave8RankingBenchmark.mjs'
];

let failed = false;

for (const script of benchmarks) {
    try {
        console.log(`Running ${script}...`);
        execSync(`node ${script}`, { stdio: 'inherit' });
    } catch (e) {
        console.error(`FAILED: ${script}`);
        failed = true;
    }
}

if (failed) {
    process.exit(1);
} else {
    console.log("ALL INSIGHT BENCHMARKS PASS.");
}
