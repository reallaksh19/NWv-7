import fs from 'node:fs';
import path from 'node:path';

const NEWSDATA_DIR = path.resolve('public/newsdata');
const OUTPUT_PATH = path.join(NEWSDATA_DIR, 'quality_dashboard.json');
const HISTORY_PATH = path.join(NEWSDATA_DIR, 'quality_dashboard_history.json');

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
  const latest = {
    insightGrade: insightQuality.grade || realInsightQuality.grade || null,
    insightScore: toNumber(insightQuality.score ?? realInsightQuality.score, 0),
    totalStories: toNumber(insightQuality.storyCount ?? insightQuality.totalStories, 0),
    usableStories36h: toNumber(insightQuality.usable36hStoryCount ?? insightQuality.usable24hStoryCount ?? insightQuality.usableStories, 0),
    sourceGroups: toNumber(insightQuality.sourceGroupCount ?? insightQuality.sourceGroups, 0),
    angleHintCoverage: toNumber(insightQuality.angleHintCoverage, 0),
    sectionsTotalStories: toNumber(sectionsQuality.totalStories, 0),
    sectionsCount: toNumber(sectionsQuality.sectionCount, 0),
  };

  const today = new Date(generatedAt).toISOString().slice(0, 10);
  const history = readJson(HISTORY_PATH, { schemaVersion: 1, days: [] });
  const prunedDays = Array.isArray(history.days) ? history.days.filter(d => d?.date !== today) : [];
  prunedDays.push({
    date: today,
    generatedAt,
    ...latest,
    sourceUptimePercent: toNumber(sourcePolicy.summary?.uptimePercent, 0),
    angleDiversityScore: toNumber(insightQuality.angleDiversityScore, 0),
  });
  prunedDays.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const days = prunedDays.slice(-7);

  const avg = (arr, key) => {
    const nums = arr.map(x => Number(x?.[key])).filter(Number.isFinite);
    if (nums.length === 0) return 0;
    return Number((nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(2));
  };

  const dashboard = {
    schemaVersion: 1,
    generatedAt,
    windowDays: 7,
    latest,
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
      avgInsightScore7d: avg(days, 'insightScore'),
      sourceUptimePercent7d: avg(days, 'sourceUptimePercent'),
      angleDiversity7d: avg(days, 'angleDiversityScore'),
    },
    history: days,
    notes: [
      'This dashboard currently reflects latest available reports and is designed for extension to persisted 7-day history.',
    ],
  };

  fs.mkdirSync(NEWSDATA_DIR, { recursive: true });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify({ schemaVersion: 1, generatedAt, days }, null, 2));
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(dashboard, null, 2));
  console.log(`Wrote ${OUTPUT_PATH}`);
}

main();
