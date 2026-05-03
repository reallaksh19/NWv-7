"""
fetch_sections_stories.py — news sections pre-fetch.

Populates public/newsdata/sections_latest.json with 9 section keys:
  topStories, india, tn, trichy, world, business, technology, sports, entertainment

Runs on the same schedule as fetch_insight_stories.py (news_prefetch.yml).
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(__file__))

import feedparser
from prefetch_common import (
    H_MS, DAY_MS, now_ms, read_json, write_json,
    normalize_basic_story, is_suppressed, compute_content_hash
)

# ── Paths ─────────────────────────────────────────────────────────────────────
SECTIONS_PATH      = 'public/newsdata/sections_latest.json'
SOURCE_HEALTH_PATH = 'public/newsdata/source_health.json'

SECTION_CACHE_MAX_AGE_MS = 2 * H_MS   # re-fetch each run (sections refresh every ~2 h)
STORY_RETAIN_HOURS       = 24          # stories older than 24h are dropped

# ── Section feeds — Tier A direct, Tier B Google News ────────────────────────
# Each entry: (url, source_name, source_group)
SECTION_FEEDS = {
    'topStories': [
        # Tier A
        ('https://www.thehindu.com/news/feeder/default.rss',
         'The Hindu', 'the_hindu'),
        ('https://feeds.feedburner.com/ndtvnews-top-stories',
         'NDTV', 'ndtv'),
        ('https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
         'Hindustan Times', 'hindustan_times'),
        ('https://economictimes.indiatimes.com/rssfeeds/1977021501.cms',
         'Economic Times', 'economic_times'),
        # Tier B
        ('https://news.google.com/rss/headlines/section/topic/TOP_STORIES?hl=en-IN&gl=IN&ceid=IN:en',
         'Google News Top', 'google_news'),
    ],
    'india': [
        ('https://www.thehindu.com/news/national/feeder/default.rss',
         'The Hindu National', 'the_hindu'),
        ('https://feeds.feedburner.com/ndtvnews-india-news',
         'NDTV India', 'ndtv'),
        ('https://timesofindia.indiatimes.com/rssfeeds/296589292.cms',
         'Times of India', 'times_of_india'),
        ('https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
         'Hindustan Times India', 'hindustan_times'),
    ],
    'tn': [
        # Tamil Nadu / Chennai
        ('https://www.thehindu.com/news/cities/chennai/feeder/default.rss',
         'The Hindu Chennai', 'the_hindu'),
        ('https://www.dtnext.in/rss',
         'DT Next', 'dtnext'),
        ('https://news.google.com/rss/search?q=Tamil+Nadu+news+today&hl=en-IN&gl=IN&ceid=IN:en',
         'Google News TN', 'google_news'),
    ],
    'trichy': [
        ('https://www.thehindu.com/news/cities/Tiruchirapalli/feeder/default.rss',
         'The Hindu Trichy', 'the_hindu'),
        ('https://news.google.com/rss/search?q=Trichy+Tiruchirappalli+news+today&hl=en-IN&gl=IN&ceid=IN:en',
         'Google News Trichy', 'google_news'),
    ],
    'world': [
        ('https://feeds.bbci.co.uk/news/world/rss.xml',
         'BBC World', 'bbc'),
        ('https://feeds.bbci.co.uk/news/rss.xml',
         'BBC', 'bbc'),
        ('https://www.thehindu.com/news/international/feeder/default.rss',
         'The Hindu International', 'the_hindu'),
        ('https://news.google.com/rss/headlines/section/topic/WORLD_NEWS?hl=en-IN&gl=IN&ceid=IN:en',
         'Google News World', 'google_news'),
    ],
    'business': [
        ('https://economictimes.indiatimes.com/rssfeeds/1977021501.cms',
         'Economic Times', 'economic_times'),
        ('https://www.moneycontrol.com/rss/latestnews.xml',
         'Moneycontrol', 'moneycontrol'),
        ('https://www.thehindubusinessline.com/news/feeder/default.rss',
         'Business Line', 'business_line'),
        ('https://www.financialexpress.com/feed/',
         'Financial Express', 'financial_express'),
        ('https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-IN&gl=IN&ceid=IN:en',
         'Google News Business', 'google_news'),
    ],
    'technology': [
        ('https://feeds.feedburner.com/gadgets360-latest',
         'Gadgets360', 'gadgets360'),
        ('https://www.thehindu.com/sci-tech/technology/feeder/default.rss',
         'The Hindu Tech', 'the_hindu'),
        ('https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-IN&gl=IN&ceid=IN:en',
         'Google News Tech', 'google_news'),
    ],
    'sports': [
        ('https://sports.ndtv.com/rss/all',
         'NDTV Sports', 'ndtv'),
        ('https://www.thehindu.com/sport/feeder/default.rss',
         'The Hindu Sport', 'the_hindu'),
        ('https://feeds.bbci.co.uk/sport/rss.xml',
         'BBC Sport', 'bbc'),
        ('https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-IN&gl=IN&ceid=IN:en',
         'Google News Sports', 'google_news'),
    ],
    'entertainment': [
        ('https://www.hindustantimes.com/feeds/rss/entertainment/rssfeed.xml',
         'Hindustan Times Entertainment', 'hindustan_times'),
        ('https://www.hindustantimes.com/feeds/rss/entertainment/tamil-cinema/rssfeed.xml',
         'Hindustan Times Tamil Cinema', 'hindustan_times'),
        ('https://feeds.feedburner.com/ndtvnews-movies',
         'NDTV Movies', 'ndtv'),
        ('https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-IN&gl=IN&ceid=IN:en',
         'Google News Entertainment', 'google_news'),
    ],
}

MAX_STORIES_PER_SECTION = 30

DEFAULT_SECTIONS_SNAPSHOT = {
    'schemaVersion': 1,
    'fetchedAt':     0,
    'contentHash':   '',
    'sections': {s: [] for s in SECTION_FEEDS},
}


def fetch_section(section: str, feeds: list, ts: int) -> tuple[list, dict]:
    results, source_health = [], {}
    for url, source, source_group in feeds:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:20]:
                pub = entry.get('published_parsed')
                pub_ms = int(time.mktime(pub) * 1000) if pub else ts
                raw = {
                    'title':       entry.get('title', ''),
                    'summary':     entry.get('summary', ''),
                    'url':         entry.get('link', ''),
                    'publishedAt': pub_ms,
                    'category':    section,
                    'region':      'in',
                }
                item = normalize_basic_story(raw, source, source_group)
                if not is_suppressed(item, 'any'):
                    results.append(item)

            source_health[source_group] = {'ok': True, 'items': len(results), 'lastSuccess': ts}
        except Exception as e:
            source_health[source_group] = {'ok': False, 'error': str(e), 'items': 0}

    return results, source_health


def dedup_section(items: list) -> list:
    """Dedup by story ID, keep most recent on collision."""
    by_id: dict = {}
    for item in sorted(items, key=lambda x: x.get('publishedAt', 0), reverse=True):
        sid = item.get('id')
        if sid and sid not in by_id:
            by_id[sid] = item
    return list(by_id.values())


def main():
    ts     = now_ms()
    cutoff = ts - STORY_RETAIN_HOURS * H_MS

    print(f'Fetching sections (ts={ts})…')
    new_sections: dict = {}
    all_health: dict   = {}

    for section, feeds in SECTION_FEEDS.items():
        items, health = fetch_section(section, feeds, ts)
        all_health.update(health)
        # Drop stories older than 24 h
        fresh = [i for i in items if i.get('publishedAt', 0) >= cutoff]
        deduped = dedup_section(fresh)
        # Most recent first, capped
        deduped.sort(key=lambda x: x.get('publishedAt', 0), reverse=True)
        new_sections[section] = deduped[:MAX_STORIES_PER_SECTION]
        print(f'  [{section}] {len(new_sections[section])} stories')

    all_stories_flat = [item for items in new_sections.values() for item in items]
    snapshot = {
        'schemaVersion': 1,
        'fetchedAt':     ts,
        'contentHash':   compute_content_hash(all_stories_flat),
        'sections':      new_sections,
    }
    write_json(SECTIONS_PATH, snapshot)

    existing_health = read_json(SOURCE_HEALTH_PATH, {'lastChecked': 0, 'sources': {}})
    existing_health['sources'].update(all_health)
    existing_health['lastChecked'] = ts
    write_json(SOURCE_HEALTH_PATH, existing_health)

    total = sum(len(v) for v in new_sections.values())
    print(f'Done. total={total}, contentHash={snapshot["contentHash"]}')


if __name__ == '__main__':
    main()
