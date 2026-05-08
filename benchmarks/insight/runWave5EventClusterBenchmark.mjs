import fs from 'fs';
import { execSync } from 'child_process';

const fixture = JSON.parse(fs.readFileSync('benchmarks/insight/fixtures/wave5_event_cluster_fixture.json'));
fs.writeFileSync('temp_in.json', JSON.stringify(fixture));

const pyCode = `
import json
from scripts.insight_worker.events.cluster_events import run_clustering
with open('temp_in.json', 'r') as f:
    data = json.load(f)
res = run_clustering(data)
with open('temp_out.json', 'w') as f:
    json.dump(res, f)
`;
fs.writeFileSync('temp.py', pyCode);
execSync('python temp.py');
const res = JSON.parse(fs.readFileSync('temp_out.json'));

if (res.length !== 3) throw new Error("bad cluster count");

const cyclone = res.find(c => c.canonicalHeadline.includes('Cyclone'));
if (!cyclone) throw new Error("cyclone missing");
if (cyclone.independentSourceCount < 2) throw new Error("independent source count bad");
if (!cyclone.snapshotPresence) throw new Error("snapshotPresence missing");
if (cyclone.preliminaryEventScore === undefined) throw new Error("preliminaryEventScore missing");

const unrelated = res.find(c => c.canonicalHeadline === 'Unrelated');
if (unrelated.storyIds.length !== 1) throw new Error("unrelated merged incorrectly");

console.log("PASS: Wave 5 Event Cluster Benchmark");
fs.unlinkSync('temp_in.json');
fs.unlinkSync('temp_out.json');
fs.unlinkSync('temp.py');
