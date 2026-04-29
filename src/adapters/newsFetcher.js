/* eslint-disable */
import { fetchNews } from '../services/newsService.js';

const SLOT_QUERIES = {
  now:       'breaking news today top stories',
  minus4h:   'India news today top headlines',
  minus12h:  'world news top stories',
  minus24h:  'business economy markets technology',
  // Section-based slots (if used)
  world:     'world news top stories today',
  india:     'India news today top stories',
  business:  'India business economy markets today',
  technology:'technology AI startups innovation',
  sports:    'cricket IPL football sports India',
  chennai:   'Chennai Tamil Nadu news today',
};

export async function fetchStoriesForSlot(slot) {
  const query = SLOT_QUERIES[slot] || `${slot} news today`;
  const news = await fetchNews(query, { newsApiKey: '' });
  if (!news || !Array.isArray(news)) return [];

  return news.map((article, idx) => ({
    id: `${slot}-${idx}-${Date.now()}`,  // UNIQUE across slots (audit v3 fix)
    title: article.headline || article.title || '',
    summary: article.description || article.summary || article.headline || '',  // NOT hardcoded (audit v3 fix)
    content: article.description || article.summary || '',
    url: article.url || article.link || '',
    publishedAt: typeof article.publishedAt === 'number'
      ? article.publishedAt
      : (article.publishedAt ? Date.parse(article.publishedAt) : Date.now()),  // Must be NUMBER (audit v3 fix)
    source: article.source || 'Unknown',
    sourceGroup: (article.source || 'unknown').toLowerCase().replace(/[^a-z]/g, '_'),
  }));
}
