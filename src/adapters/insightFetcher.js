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
