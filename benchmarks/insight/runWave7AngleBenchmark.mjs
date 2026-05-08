import fs from 'fs';
import { execSync } from 'child_process';

const fixture = JSON.parse(fs.readFileSync('benchmarks/insight/fixtures/wave7_angle_fixture.json'));
fs.writeFileSync('temp_in.json', JSON.stringify(fixture));

const pyCode = `
import json
from scripts.insight_worker.angles.select_angles import select_angles
with open('temp_in.json', 'r') as f:
    data = json.load(f)

res = select_angles(data['stories'], data['parent'])

with open('temp_out.json', 'w') as f:
    json.dump(res, f)
`;
fs.writeFileSync('temp.py', pyCode);
execSync('python temp.py');
const res = JSON.parse(fs.readFileSync('temp_out.json'));

const hasAngle = (angle) => res.some(r => r.angle === angle);

if (!hasAngle('base_report')) throw new Error("base_report missing");
if (!hasAngle('official_response')) throw new Error("official missing");
if (!hasAngle('regional_followup')) throw new Error("regional missing");
if (!hasAngle('fact_update')) throw new Error("fact update missing");
if (!hasAngle('background_context')) throw new Error("background missing");
if (!hasAngle('market_reaction')) throw new Error("market missing");

const admitted = res.every(r => r.admittedBecause && r.admittedBecause.length > 0);
if (!admitted) throw new Error("admittedBecause missing");

const marketAngles = res.filter(r => r.angle === 'market_reaction');
if (marketAngles.length > 1) throw new Error("same-angle repetition not limited");

console.log("PASS: Wave 7 Angle Benchmark");
fs.unlinkSync('temp_in.json');
fs.unlinkSync('temp_out.json');
fs.unlinkSync('temp.py');
