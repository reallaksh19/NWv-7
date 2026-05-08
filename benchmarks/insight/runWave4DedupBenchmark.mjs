import fs from 'fs';
import { execSync } from 'child_process';

const fixture = JSON.parse(fs.readFileSync('benchmarks/insight/fixtures/wave4_dedup_fixture.json'));
fs.writeFileSync('temp_in.json', JSON.stringify(fixture));

const pyCode = `
import json
from scripts.insight_worker.dedup.dedup_engine import run_dedup
with open('temp_in.json', 'r') as f:
    data = json.load(f)
res = run_dedup(data)
with open('temp_out.json', 'w') as f:
    json.dump(res, f)
`;
fs.writeFileSync('temp.py', pyCode);
execSync('python temp.py');
const res = JSON.parse(fs.readFileSync('temp_out.json'));

if (res.diagnostics.rawStoryCount !== 8) throw new Error("bad raw count");
if (res.diagnostics.exactDuplicateCount !== 1) throw new Error("exact missed");
if (res.diagnostics.sameSourceDuplicateCount !== 1) throw new Error("same source missed");
if (res.diagnostics.syndicatedDuplicateCount !== 1) throw new Error("syndicated missed");
if (res.diagnostics.dedupedStoryCount >= 8) throw new Error("dedup failed");

const hasOfficial = res.stories.some(s => s.angle === 'official_response');
if (!hasOfficial) throw new Error("official angle dropped");

console.log("PASS: Wave 4 Dedup Benchmark");
fs.unlinkSync('temp_in.json');
fs.unlinkSync('temp_out.json');
fs.unlinkSync('temp.py');
