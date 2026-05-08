import fs from 'fs';

const historyPath = 'public/newsdata/insight_history.json';
const latestPath = 'public/newsdata/insight_latest.json';
const healthPath = 'public/newsdata/insight_source_health.json';

if (!fs.existsSync(historyPath)) throw new Error("history missing");
if (!fs.existsSync(latestPath)) throw new Error("latest missing");
if (!fs.existsSync(healthPath)) throw new Error("health missing");

const history = JSON.parse(fs.readFileSync(historyPath));
if (!history.slots || !history.slots.now || !history.slots.minus4h || !history.slots.minus12h || !history.slots.minus24h) {
    throw new Error("history.slots malformed");
}

const latest = JSON.parse(fs.readFileSync(latestPath));
if (!Array.isArray(latest.stories)) throw new Error("latest.stories not an array");

const health = JSON.parse(fs.readFileSync(healthPath));
if (!Array.isArray(health.sources)) throw new Error("health.sources not an array");

console.log("PASS: Insight history integrity verified.");
