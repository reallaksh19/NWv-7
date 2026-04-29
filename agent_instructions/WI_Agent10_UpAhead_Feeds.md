# WI — Agent 10: Up Ahead — Feed Query Quality
**Sequence:** 10 of 10
**Prerequisite:** None (can run in parallel with others after Agent 01)
**Estimated changes:** ~50 lines in 1 file

---

## Objective
The Up Ahead / Planner sections (Movies, Events, Festivals, Alerts, Airlines) frequently show general news articles about those topics instead of actual upcoming structured events. This happens because the RSS queries are too broad.

Improve the feed source registry queries to be more specific and date-oriented.

---

## Context
- The real data pipeline is in `src/intelligence/feedSourceRegistry.js`
- This file defines the RSS feeds fetched per category + location
- On static GitHub Pages, `isStaticHost: true` is passed, which limits available sources
- All feeds must be free public RSS — no API keys, no scraping
- Google News RSS search is the most flexible: `https://news.google.com/rss/search?q=QUERY&hl=en-IN&gl=IN&ceid=IN:en`

---

## File: `src/intelligence/feedSourceRegistry.js`

First, view the current file to see the existing feed structure, then replace feeds per category as described below.

### What to look for
Find entries like:
```javascript
{ url: 'https://news.google.com/rss/search?q=...', category: 'movies', location: 'India', ... }
```

### Improvements to make (replace query strings only — keep the URL structure intact)

#### Category: `movies` (India / Chennai)
Replace generic queries with date-specific ones:

| Old query | New query |
|-----------|-----------|
| `movies India upcoming` | `upcoming movie release India 2025` |
| `bollywood release` | `bollywood release date theatre this week` |
| `tamil movies release` | `tamil movie release date theatre Chennai` |

#### Category: `events` (Chennai, Muscat)
| Old query | New query |
|-----------|-----------|
| `events Chennai` | `upcoming events concert exhibition Chennai this week` |
| `events Muscat` | `upcoming events Muscat Oman this month` |

#### Category: `festivals` (India)
| Old query | New query |
|-----------|-----------|
| `festivals India` | `India festival holiday 2025 upcoming date` |
| `festivals Tamil Nadu` | `Tamil Nadu festival holiday 2025` |

#### Category: `alerts` (Chennai, Trichy, Muscat)
| Old query | New query |
|-----------|-----------|
| `alerts Chennai` | `Chennai power cut water supply disruption TANGEDCO 2025` |
| `alerts Muscat` | `Muscat Oman advisory road closure announcement` |

#### Category: `airlines` (Chennai, Muscat)
| Old query | New query |
|-----------|-----------|
| `airlines offer` | `flight fare sale booking open Chennai Muscat India 2025` |
| `Oman Air offer` | `Oman Air IndiGo Air India fare sale booking 2025` |

#### Category: `weather_alerts` (Chennai, Trichy, Muscat)
| Old query | New query |
|-----------|-----------|
| `weather alert Chennai` | `IMD weather warning alert Chennai heavy rain cyclone` |
| `weather Muscat` | `Oman Met Department weather warning Muscat` |

---

## How to apply the changes

1. Open `src/intelligence/feedSourceRegistry.js`
2. Find each feed entry's URL query string (the part after `?q=`)
3. Update only the query string to match the improved queries above
4. Keep everything else: `category`, `location`, `trust`, `sourceType` fields unchanged

**Example of a single feed entry change:**
```javascript
// BEFORE:
{
  url: 'https://news.google.com/rss/search?q=movies+India+upcoming&hl=en-IN&gl=IN&ceid=IN:en',
  category: 'movies',
  location: 'India',
  trust: 'medium',
  sourceType: 'google-news'
}

// AFTER:
{
  url: 'https://news.google.com/rss/search?q=upcoming+movie+release+India+2025&hl=en-IN&gl=IN&ceid=IN:en',
  category: 'movies',
  location: 'India',
  trust: 'medium',
  sourceType: 'google-news'
}
```

> **Important:** URL-encode spaces as `+` in the query string (Google News RSS uses `+` not `%20`).

---

## Deliverable
- `src/intelligence/feedSourceRegistry.js` — improved query strings for movies, events, festivals, alerts, airlines, weather_alerts categories

---

## QC Checklist

- [ ] Navigate to Up Ahead tab (`/up-ahead`)
- [ ] **Movies section** — items should mention "releasing", "theatre", "premiere", or specific dates
- [ ] **Events section** — items should mention "concert", "exhibition", "upcoming", not old past events
- [ ] **Alerts section** — items should mention "power cut", "water supply", "TANGEDCO", "road closure", not general news
- [ ] **Airlines section** — items should mention "fare sale", "booking open", specific airlines
- [ ] **Key test:** Items should feel actionable (you can plan around them) not just informational news
- [ ] No items older than 7 days appear in the timeline
- [ ] Console shows `[UpAheadService]` logs without errors
- [ ] Planner tab (`/my-planner`) shows items that were added from Up Ahead (if any were added)

---

## Do NOT change
- `src/services/upAheadService.js` — logic is fine, only feed sources need updating
- `src/config/settings_upahead.js` — the keyword lists there are already good
- Any other files outside `src/intelligence/feedSourceRegistry.js`

---

## Important Note for Agent
If `src/intelligence/feedSourceRegistry.js` does not exist or has a very different structure than expected, **stop and report back** rather than guessing. The QC criteria above can be used to verify whether the existing structure already works or needs adjustment.
