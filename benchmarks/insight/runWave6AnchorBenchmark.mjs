import fs from 'fs';
import { execSync } from 'child_process';

const fixture = JSON.parse(fs.readFileSync('benchmarks/insight/fixtures/wave6_anchor_fixture.json'));
fs.writeFileSync('temp_in.json', JSON.stringify(fixture));

const pyCode = `
import json
from scripts.insight_worker.anchors.build_top_story_anchors import build_anchors
from scripts.insight_worker.anchors.anchor_similarity import match_event_to_anchor
with open('temp_in.json', 'r') as f:
    data = json.load(f)

anchors_result = build_anchors(data['stories'])
anchors = anchors_result['anchors']

results = []
for ev in data['events']:
    a_id, score, reasons = match_event_to_anchor(ev, anchors)
    results.append({
        "headline": ev['canonicalHeadline'],
        "anchorId": a_id,
        "score": score,
        "reasons": reasons
    })

out = {
    "anchors": anchors_result,
    "matches": results
}

with open('temp_out.json', 'w') as f:
    json.dump(out, f)
`;
fs.writeFileSync('temp.py', pyCode);
execSync('python temp.py');
const res = JSON.parse(fs.readFileSync('temp_out.json'));

if (res.anchors.anchorPolicy.usesUserVisibleFilteredTopStories === true) throw new Error("policy fail");

const cycloneMatch = res.matches.find(m => m.headline.includes('Cyclone'));
if (cycloneMatch.score < 0.62) throw new Error("cyclone match failed");

const marketMatch = res.matches.find(m => m.headline.includes('Market'));
if (marketMatch.score < 0.62) throw new Error("market match failed");

const policyMatch = res.matches.find(m => m.headline.includes('policy'));
if (policyMatch.score >= 0.62) throw new Error("policy matched unexpectedly");

console.log("PASS: Wave 6 Anchor Benchmark");
fs.unlinkSync('temp_in.json');
fs.unlinkSync('temp_out.json');
fs.unlinkSync('temp.py');
