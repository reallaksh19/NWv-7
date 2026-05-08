import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv();
addFormats(ajv);

const schemas = [
  'public/newsdata/schema/insight_digest.schema.json',
  'public/newsdata/schema/insight_diagnostics.schema.json',
  'public/newsdata/schema/top_story_anchors.schema.json',
  'public/newsdata/schema/insight_source_health.schema.json'
];

const dataFiles = [
  'public/newsdata/insight_digest.json',
  'public/newsdata/insight_diagnostics.json',
  'public/newsdata/top_story_anchors.json',
  'public/newsdata/insight_source_health.json'
];

console.log("Testing Insight Revamp Contract Schemas...");

for (let i = 0; i < schemas.length; i++) {
  const schemaPath = schemas[i];
  const dataPath = dataFiles[i];

  if (!fs.existsSync(schemaPath)) {
    console.error(`FAIL: Schema not found at ${schemaPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(dataPath)) {
    console.log(`WARN: Data file not found at ${dataPath}, skipping schema validation against data.`);
    continue;
  }

  try {
    const schemaContent = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const dataContent = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const validate = ajv.compile(schemaContent);
    const valid = validate(dataContent);

    if (!valid) {
      console.error(`FAIL: ${path.basename(dataPath)} does not match schema ${path.basename(schemaPath)}.`);
      console.error(validate.errors);
      process.exit(1);
    } else {
       console.log(`PASS: ${path.basename(dataPath)} matches schema.`);
    }
  } catch (e) {
    console.error(`FAIL: Error validating ${path.basename(dataPath)} against ${path.basename(schemaPath)}. ${e.message}`);
    process.exit(1);
  }
}
console.log("All schemas PASS.");
