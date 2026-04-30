import { runInsightPipeline, applyIncrementalUpdate, DEFAULT_CONFIG, normalizeStory } from '../insight/src/index.ts';
import { fetchStoriesForSlot as fetchRawStoriesForSlot } from './newsFetcher.js';
import { getEmbeddings } from './embeddingsAdapter.js';
import { extractEntities, extractVerbs, extractNumbers, extractKeywords } from './nlpAdapter.js';

export async function slotFetcher(slot) {
  const rawStories = await fetchRawStoriesForSlot(slot);
  if (!rawStories.length) return [];

  const texts = rawStories.map((story) => `${story.title || ''} ${story.summary || ''}`.trim());
  const embeddings = await getEmbeddings(texts);

  const enriched = await Promise.all(rawStories.map(async (raw, index) => {
    const text = texts[index];
    const [entities, keywords, verbs, numbers] = await Promise.all([
      extractEntities(text),
      extractKeywords(text),
      extractVerbs(text),
      extractNumbers(text),
    ]);

    return normalizeStory(
      raw,
      slot,
      DEFAULT_CONFIG,
      embeddings[index],
      entities,
      keywords,
      verbs,
      numbers,
    );
  }));

  return enriched.filter(Boolean);
}

export { runInsightPipeline, applyIncrementalUpdate, DEFAULT_CONFIG };

// ── Benchmark slot fetcher (dev mode only) ────────────────────────────────
import { buildInsightBenchmarkArticles } from '../benchmarks/insightBenchmark.js';

export const benchmarkSlotFetcher = async (slot) => {
  const all = buildInsightBenchmarkArticles();
  const NOW = Date.now();
  const H   = 3_600_000;
  return all.filter(a => {
    const age = NOW - a.publishedAt;
    switch (slot) {
      case 'now'      : return age < 4 * H;
      case 'minus4h'  : return age >= 4 * H  && age < 12 * H;
      case 'minus12h' : return age >= 12 * H && age < 24 * H;
      case 'minus24h' : return age >= 24 * H;
      default         : return true;
    }
  });
};
