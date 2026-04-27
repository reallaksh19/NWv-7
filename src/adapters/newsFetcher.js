/**
 * newsFetcher.js — Slot-aware news fetcher for the Insight pipeline.
 *
 * Agent A owns this file. Do not modify during Agent B or C work.
 *
 * Architecture note:
 *   newsService.fetchNews() returns a TRANSFORMED shape where pubDate has
 *   already been converted to a locale time string ("8:30 AM"). The raw ISO
 *   date is not available in the output. We reconstruct publishedAt by parsing
 *   the time string and combining it with today's date, then applying a
 *   slot-boundary guard to discard articles outside the expected window.
 *   Articles that cannot be placed within any slot window use the slot midpoint.
 */

import { fetchNews } from '../services/newsService.js';

// ── FNV-1a 32-bit hash ────────────────────────────────────────────────────────
// Deterministic ID generation. Never use Math.random() for story IDs — the
// dedup layer uses IDs as Map keys across incremental update cycles.
function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}

// ── Slot time windows (ms offset from now) ────────────────────────────────────
const SLOT_WINDOWS = {
  now:      { minAge: 0,                    maxAge: 2  * 60 * 60 * 1000 },
  minus4h:  { minAge: 2  * 60 * 60 * 1000, maxAge: 6  * 60 * 60 * 1000 },
  minus12h: { minAge: 6  * 60 * 60 * 1000, maxAge: 18 * 60 * 60 * 1000 },
  minus24h: { minAge: 18 * 60 * 60 * 1000, maxAge: 30 * 60 * 60 * 1000 },
};

// ── Slot-appropriate query strings ────────────────────────────────────────────
// 'now' uses a tight breaking-news query.
// Older slots use broader queries to reach articles that have dropped off
// the "latest news" feed but are still present in Google News RSS history.
const SLOT_QUERIES = {
  now:      'breaking news India world today',
  minus4h:  'top news India world today',
  minus12h: 'news India economy markets today',
  minus24h: 'India world news yesterday latest',
};

// ── sourceGroup canonical key map ─────────────────────────────────────────────
// Keys must match TIER_MAP in src/insight/src/pipeline/normalize.ts exactly.
// Any key not in TIER_MAP falls to Tier C — that is intentional.
const SOURCE_GROUP_MAP = {
  'the hindu':          'the hindu',
  'thehindu':           'the hindu',
  'hindu':              'the hindu',
  'bbc':                'bbc',
  'bbc news':           'bbc',
  'bbc world':          'bbc',
  'reuters':            'reuters',
  'reuters india':      'reuters',
  'ap':                 'ap',
  'associated press':   'ap',
  'bloomberg':          'bloomberg',
  'bloomberg india':    'bloomberg',
  'ft':                 'financial express',
  'financial express':  'financial express',
  'the financial express': 'financial express',
  'ndtv':               'ndtv',
  'ndtv news':          'ndtv',
  'toi':                'toi',
  'times of india':     'toi',
  'the times of india': 'toi',
  'moneycontrol':       'moneycontrol',
  'cnbc tv18':          'moneycontrol',   // same tier
  'oman observer':      'oman observer',
  'oman daily observer':'oman observer',
};

function toSourceGroup(sourceName) {
  if (!sourceName) return 'unknown';
  const key = sourceName.toLowerCase().trim();
  return SOURCE_GROUP_MAP[key] ?? (key.replace(/\s+/g, '_') + '_group');
}

// ── publishedAt reconstruction ────────────────────────────────────────────────
// newsService converts pubDate → locale time string ("8:30 AM").
// We reconstruct by combining today's date with the parsed time.
// If the result is more than 1 hour in the future, subtract 24h (yesterday's article).
function parsePublishedAt(timeStr) {
  if (!timeStr) return null;

  // Fast path: already a numeric epoch or full ISO string
  if (typeof timeStr === 'number') return timeStr;
  const epoch = Number(timeStr);
  if (!isNaN(epoch) && epoch > 1_000_000_000_000) return epoch;
  const direct = Date.parse(timeStr);
  if (!isNaN(direct) && direct > 1_000_000_000_000) return direct;

  // Slow path: locale time string like "8:30 AM" or "08:30"
  const today = new Date().toDateString();
  const attempt = new Date(`${today} ${timeStr}`);
  if (isNaN(attempt.getTime())) return null;

  let ts = attempt.getTime();
  // Article can't be published in the future — slide it back 24h
  if (ts > Date.now() + 60 * 60 * 1000) ts -= 24 * 60 * 60 * 1000;
  return ts;
}

/**
 * Returns RawStory[] for the given snapshot slot.
 * Stories outside the slot's time window are discarded.
 * Falls back to slot midpoint for unparseable timestamps rather than
 * dropping the article — a story with uncertain age is better than no story.
 *
 * @param {string} slot - "now" | "minus4h" | "minus12h" | "minus24h"
 * @returns {Promise<import('../insight/src/types').RawStory[]>}
 */
export async function fetchStoriesForSlot(slot) {
  const now = Date.now();
  const window = SLOT_WINDOWS[slot] ?? SLOT_WINDOWS.now;
  const query  = SLOT_QUERIES[slot]  ?? SLOT_QUERIES.now;

  // newsService.fetchNews() may return [] on network failure — that is fine.
  // The pipeline calls this with Promise.all and degrades gracefully on empty slots.
  let articles = [];
  try {
    articles = await fetchNews(query) ?? [];
  } catch (err) {
    console.warn(`[newsFetcher] fetchNews failed for slot=${slot}:`, err.message);
    return [];
  }

  const rawStories = [];
  const slotMidpoint = now - (window.minAge + (window.maxAge - window.minAge) / 2);

  for (const item of articles) {
    const title   = (item.headline || item.title || '').trim();
    const summary = (item.summary || item.description || '').trim();
    const url     = (item.url || item.link || '').trim();
    const source  = (item.source || '').trim();

    // Hard requirements — silently drop rather than emit garbage
    if (!title) continue;
    if (!url)   continue;

    // Reconstruct publishedAt; fall back to slot midpoint if unparseable
    const parsedTs = parsePublishedAt(item.time || item.pubDate || item.publishedAt);
    const publishedAt = (parsedTs !== null) ? parsedTs : slotMidpoint;

    // Slot window guard — discard articles that belong to a different slot
    const age = now - publishedAt;
    if (age < window.minAge || age > window.maxAge) {
      // Exception: for the 'now' slot, keep articles that couldn't be timestamped
      // (parsedTs === null) rather than discarding potentially-current articles.
      if (!(slot === 'now' && parsedTs === null)) continue;
    }

    rawStories.push({
      id:          item.id || fnv1a(url + title),
      title,
      summary:     summary || 'No summary available.',
      source,
      sourceGroup: toSourceGroup(source),
      url,
      publishedAt,
      category:    item.category  || 'General',
      region:      item.region    || '',
      language:    item.language  || 'en',
    });
  }

  return rawStories;
}
