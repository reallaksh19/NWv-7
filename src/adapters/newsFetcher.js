/* eslint-disable */
import { fetchNews } from '../services/newsService.js';

export async function fetchStoriesForSlot(slot) {
  // 'fetchNews' expects (query, keys)
  // For the insight page mock we just query for 'latest news' or 'top news'
  const news = await fetchNews('latest news', { newsApiKey: '' });
  if (!news || !Array.isArray(news)) {
    return [];
  }
  return news.map(article => ({
    id: article.id || Math.random().toString(36).substring(7),
    title: article.headline || '',
    summary: article.summary || '',
    content: article.summary || '',
    url: article.url || '',
    publishedAt: article.time ? new Date().toISOString() : new Date().toISOString(), // Mock ISO from time
    source: article.source || 'Unknown',
    sourceGroup: 'digital'
  }));
}
