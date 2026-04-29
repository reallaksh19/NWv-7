# WI — Agent 02: Market — CORS Proxy Fallbacks
**Sequence:** 2 of 10
**Prerequisite:** Agent 01 complete
**Estimated changes:** ~12 lines in 1 file

---

## Objective
The Market page never loads data because the single CORS proxy (`api.codetabs.com`) is rate-limited and frequently returns errors. Add multiple fallback proxies so that if one fails, the next is tried automatically.

---

## Context
- File: `src/services/indianMarketService.js`
- The proxy list is at **line 7**
- The `fetchThroughProxies` function (lines 29–40) already loops through all proxies — you only need to add more proxies to the array
- All proxies must be client-side (no backend) — this is a static GitHub Pages app
- Proxies are tried in order; first success wins

---

## File: `src/services/indianMarketService.js`

**What to do:** Replace line 7 only.

**BEFORE (current line 7):**
```javascript
const PROXIES = [(url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`];
```

**AFTER (replace with this exactly):**
```javascript
const PROXIES = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
];
```

> That is the entire change — 1 line replaced with 6 lines.

---

## Why this works
- `allorigins.win` — free, reliable, supports JSON responses
- `corsproxy.io` — popular, fast for Yahoo Finance
- `codetabs.com` — kept as 3rd fallback (was the only one before)
- `thingproxy` — last resort fallback

The existing `fetchThroughProxies` function already handles the loop and error catching. No other code changes needed.

---

## Deliverable
- `src/services/indianMarketService.js` — line 7 replaced (PROXIES array)

---

## QC Checklist

- [ ] Run `npm run dev`, open browser dev tools → Network tab
- [ ] Navigate to Market tab (`/markets`)
- [ ] Within 15 seconds, at least one of these should appear as a **200 response** in network:
  - `api.allorigins.win` OR `corsproxy.io` OR `api.codetabs.com`
- [ ] NIFTY 50 value appears on screen (any number, even stale)
- [ ] SENSEX value appears on screen
- [ ] No infinite loading spinner (loading resolves within 20 seconds)
- [ ] Console does NOT show: `Failed to fetch` for all 4 proxies simultaneously
  - (Some may fail, but at least one should succeed)
- [ ] If ALL proxies fail, the page shows a graceful error message, not a blank page

---

## Do NOT change
- Any other part of `indianMarketService.js`
- `MarketContext.jsx`
- `MarketPage.jsx`
- Any CSS files
