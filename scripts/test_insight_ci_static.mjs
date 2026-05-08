import fs from 'fs';

const files = [
  'public/newsdata/insight_digest.json',
  'public/newsdata/insight_diagnostics.json',
  'public/newsdata/top_story_anchors.json',
  'public/newsdata/insight_latest.json',
  'public/newsdata/insight_history.json',
  'public/newsdata/insight_source_health.json'
];

let missing = false;
for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`Missing static output file: ${file}`);
    missing = true;
  }
}

if (missing) {
  process.exit(1);
}

console.log("PASS: Static output files exist.");
