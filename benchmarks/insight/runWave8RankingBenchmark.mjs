import fs from 'fs';
import { execSync } from 'child_process';

const fixture = JSON.parse(fs.readFileSync('benchmarks/insight/fixtures/wave8_ranking_fixture.json'));
fs.writeFileSync('temp_in.json', JSON.stringify(fixture));

const pyCode = `
import json
from scripts.insight_worker.ranking.rank_events import rank_events
from scripts.insight_worker.ranking.select_buckets import select_buckets
with open('temp_in.json', 'r') as f:
    data = json.load(f)

ranked = rank_events(data)
selected = select_buckets(ranked)

with open('temp_out.json', 'w') as f:
    json.dump(selected, f)
`;
fs.writeFileSync('temp.py', pyCode);
execSync('python temp.py');
const res = JSON.parse(fs.readFileSync('temp_out.json'));

if (res.length === 0) throw new Error("selection failed");

const explainer = res[0];
if (explainer.bucket !== 'top_story_explainer') throw new Error("top_story_explainer not first");
if (explainer.canonicalHeadline === 'Unrelated High Volume') throw new Error("unrelated high volume dominated top section");
if (explainer.canonicalHeadline !== 'Small Anchor Matched') throw new Error("small anchor matched did not win");

const dev = res.find(r => r.bucket === 'developing_now');
if (!dev || dev.canonicalHeadline !== 'Developing Market') throw new Error("developing_now missing or wrong");

const slow = res.find(r => r.bucket === 'slow_burn');
if (!slow || slow.canonicalHeadline !== 'Persistent Policy') throw new Error("slow_burn missing or wrong");

console.log("PASS: Wave 8 Ranking Benchmark");
fs.unlinkSync('temp_in.json');
fs.unlinkSync('temp_out.json');
fs.unlinkSync('temp.py');
