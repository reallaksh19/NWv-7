import fs from 'fs';
import path from 'path';

function validateSchema(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: Schema not found at ${filePath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  try {
    JSON.parse(content);
    console.log(`PASS: ${path.basename(filePath)} is valid JSON.`);
  } catch (e) {
    console.error(`FAIL: ${path.basename(filePath)} is not valid JSON. ${e.message}`);
    process.exit(1);
  }
}

const schemas = [
  'public/newsdata/schema/insight_digest.schema.json',
  'public/newsdata/schema/insight_diagnostics.schema.json',
  'public/newsdata/schema/top_story_anchors.schema.json',
  'public/newsdata/schema/insight_source_health.schema.json'
];

console.log("Testing Insight Revamp Contract Schemas...");
schemas.forEach(validateSchema);
console.log("All schemas PASS.");
