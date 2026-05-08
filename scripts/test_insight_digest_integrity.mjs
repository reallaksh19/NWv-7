import fs from 'fs';

const digestPath = 'public/newsdata/insight_digest.json';
const diagnosticsPath = 'public/newsdata/insight_diagnostics.json';
const anchorsPath = 'public/newsdata/top_story_anchors.json';

if (!fs.existsSync(digestPath)) throw new Error("digest missing");
if (!fs.existsSync(diagnosticsPath)) throw new Error("diagnostics missing");
if (!fs.existsSync(anchorsPath)) throw new Error("anchors missing");

const digest = JSON.parse(fs.readFileSync(digestPath));
if (digest.schemaVersion !== "2.0.0") throw new Error("digest schema invalid");
if (!Array.isArray(digest.cards)) throw new Error("digest cards not an array");

const diag = JSON.parse(fs.readFileSync(diagnosticsPath));
if (typeof diag.rawStoryCount !== 'number') throw new Error("diag raw count missing");

console.log("PASS: Insight digest integrity verified.");
