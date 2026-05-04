import { runInsightPipeline, applyIncrementalUpdate, DEFAULT_CONFIG, normalizeStory } from '../insight/src/index.ts';
import { fetchStoriesForSlot as fetchRawStoriesForSlot } from './newsFetcher.js';
import { getEmbeddings } from './embeddingsAdapter.js';
import { extractEntities, extractVerbs, extractNumbers, extractKeywords } from './nlpAdapter.js';
import { loadInsightSnapshot, createSnapshotRawFetcher } from './insightSnapshotFetcher.js';
import { getRuntimeCapabilities } from '../runtime/runtimeCapabilities.js';

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

/**
 * createInsightFetcher — returns the appropriate SlotFetcher depending on runtime.
 *
 * On github.io (preferSnapshots = true):
 *   1. Try fresh snapshot  (file age ≤ 3 h)
 *   2. Try stale snapshot  (any age — used with warning)
 *   3. Empty state         (never falls back to live CORS proxies)
 *
 * On full-runtime (local / self-hosted):
 *   Returns the live slotFetcher as before.
 *
 * @returns {Promise<{ fetcher: Function, source: string, snapshotTs: number, contentHash: string }>}
 */
export async function createInsightFetcher() {
  const { preferSnapshots } = getRuntimeCapabilities();

  if (preferSnapshots) {
    const fresh = await loadInsightSnapshot({ allowStale: false });
    if (fresh) {
      return {
        fetcher:     createSnapshotRawFetcher(fresh),
        source:      'snapshot',
        snapshotTs:  fresh.fetchedAt,
        contentHash: fresh.contentHash,
      };
    }

    const stale = await loadInsightSnapshot({ allowStale: true });
    if (stale) {
      console.warn('[InsightFetcher] Using stale snapshot — fresh snapshot unavailable');
      return {
        fetcher:     createSnapshotRawFetcher(stale),
        source:      'stale-snapshot',
        snapshotTs:  stale.fetchedAt,
        contentHash: stale.contentHash,
        // Relax quality gates so stale stories still form clusters
        pipelineConfigOverrides: { MIN_CHILD_COUNT: 1, WEAK_TREE_TOLERANCE: true },
      };
    }

    // No snapshot available — return empty state (never hit live APIs on static host)
    return {
      fetcher:     async () => [],
      source:      'unavailable',
      snapshotTs:  0,
      contentHash: '',
    };
  }

  // Full-runtime: use live slotFetcher
  return {
    fetcher:     slotFetcher,
    source:      'live',
    snapshotTs:  Date.now(),
    contentHash: '',
  };
}

import { buildInsightBenchmarkArticles } from '../benchmarks/insightBenchmark.js';

// ── Benchmark slot fetcher (dev mode only) ────────────────────────────────
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
      case 'minus24h' : return age >= 24 * H && age < 36 * H;
      default         : return true;
    }
  });
};
