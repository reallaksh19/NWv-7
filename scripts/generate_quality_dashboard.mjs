import fs from 'node:fs';
import path from 'node:path';

const NEWSDATA_DIR = path.resolve('public/newsdata');
const OUTPUT_PATH = path.join(NEWSDATA_DIR, 'quality_dashboard.json');

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function main() {
  const insightQuality = readJson(path.join(NEWSDATA_DIR, 'insight_quality_report.json'), {});
  const sectionsQuality = readJson(path.join(NEWSDATA_DIR, 'sections_quality_report.json'), {});
  const sourcePolicy = readJson(path.join(NEWSDATA_DIR, 'source_policy_report.json'), {});
  const sectionSourcePolicy = readJson(path.join(NEWSDATA_DIR, 'section_source_policy_report.json'), {});
  const realInsightQuality = readJson(path.join(NEWSDATA_DIR, 'real_insight_quality_report.json'), {});

  const generatedAt = Date.now();
  const dashboard = {
    schemaVersion: 1,
    generatedAt,
    windowDays: 7,
    latest: {
      insightGrade: insightQuality.grade || realInsightQuality.grade || null,
      insightScore: toNumber(insightQuality.score ?? realInsightQuality.score, 0),
      totalStories: toNumber(insightQuality.totalStories, 0),
      usableStories36h: toNumber(insightQuality.usableStories, 0),
      sourceGroups: toNumber(insightQuality.sourceGroups, 0),
      angleHintCoverage: toNumber(insightQuality.angleHintCoverage, 0),
      sectionsTotalStories: toNumber(sectionsQuality.totalStories, 0),
      sectionsCount: toNumber(sectionsQuality.sectionCount, 0),
    },
    sourceHealth: {
      insight: {
        activeFeeds: toNumber(sourcePolicy.summary?.activeFeedCount, 0),
        suppressedFeeds: toNumber(sourcePolicy.summary?.suppressedFeedCount, 0),
        weakFeeds: toNumber(sourcePolicy.summary?.weakFeedCount, 0),
      },
      sections: {
        activeFeeds: toNumber(sectionSourcePolicy.summary?.activeFeedCount, 0),
        weakFeeds: toNumber(sectionSourcePolicy.summary?.weakFeedCount, 0),
      },
    },
    trends: {
      avgInsightScore7d: toNumber(insightQuality.score ?? realInsightQuality.score, 0),
      sourceUptimePercent7d: toNumber(sourcePolicy.summary?.uptimePercent, 0),
      angleDiversity7d: toNumber(insightQuality.angleDiversityScore, 0),
    },
    notes: [
      'This dashboard currently reflects latest available reports and is designed for extension to persisted 7-day history.',
    ],
  };

  fs.mkdirSync(NEWSDATA_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(dashboard, null, 2));
  console.log(`Wrote ${OUTPUT_PATH}`);
}

main();
