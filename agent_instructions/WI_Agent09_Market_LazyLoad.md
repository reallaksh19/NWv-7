# WI — Agent 09: Market Context — Lazy Loading
**Sequence:** 9 of 10
**Prerequisite:** Agent 02 complete
**Estimated changes:** ~30 lines in 2 files

---

## Objective
Currently `MarketContext` fires a Yahoo Finance API call immediately when the app loads, even if the user is on the Main page. This:
1. Wastes the CORS proxy rate limit (each proxy has request caps)
2. Floods the console with CORS errors on startup
3. Slows down initial page load

Fix: only fetch market data when the user first navigates to the Market tab.

---

## File 1 of 2: `src/context/MarketContext.jsx`

### Change 1 of 2: Add `initialized` state and `ensureBoot` function

**BEFORE (lines 10–14):**
```javascript
export function MarketProvider({ children }) {
    const [marketData, setMarketData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);
```

**AFTER:**
```javascript
export function MarketProvider({ children }) {
    const [marketData, setMarketData] = useState(null);
    const [loading, setLoading] = useState(false); // Changed: false until triggered
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);
    const [initialized, setInitialized] = useState(false);
```

### Change 2 of 2: Remove auto-load useEffect; add `ensureBoot` to context value

**BEFORE (lines 95–101):**
```javascript
    useEffect(() => {
        loadMarketData();
    }, [loadMarketData]);

    const refreshMarket = useCallback(() => {
        return loadMarketData(true);
    }, [loadMarketData]);
```

**AFTER (replace entire block):**
```javascript
    // REMOVED: auto-load on mount
    // Market data now fetched lazily when user visits the Market tab

    const ensureBoot = useCallback(() => {
        if (!initialized) {
            setInitialized(true);
            loadMarketData();
        }
    }, [initialized, loadMarketData]);

    const refreshMarket = useCallback(() => {
        return loadMarketData(true);
    }, [loadMarketData]);
```

**BEFORE (lines 103–112 — context value):**
```javascript
    return (
        <MarketContext.Provider value={{
            marketData,
            loading,
            error,
            lastFetch,
            refreshMarket
        }}>
```

**AFTER (add `ensureBoot` to the value):**
```javascript
    return (
        <MarketContext.Provider value={{
            marketData,
            loading,
            error,
            lastFetch,
            refreshMarket,
            ensureBoot
        }}>
```

---

## File 2 of 2: `src/pages/MarketPage.jsx`

### Change: Call `ensureBoot` when Market page mounts

**Find line 7:**
```javascript
import { useMarket } from '../context/MarketContext';
```
*(no change to import)*

**Find line 98 (inside MarketPage function):**
```javascript
const { marketData, loading, error, refreshMarket, lastFetch } = useMarket();
```

**AFTER (add `ensureBoot` to destructuring):**
```javascript
const { marketData, loading, error, refreshMarket, lastFetch, ensureBoot } = useMarket();
```

**Then, add a new `useEffect` after line 100 (after the `marketSettings` line):**
```javascript
// Trigger lazy market data load on first visit to this page
useEffect(() => {
    ensureBoot();
}, [ensureBoot]);
```

---

## Deliverable
- `src/context/MarketContext.jsx` — lazy boot with `ensureBoot`, loading starts as `false`
- `src/pages/MarketPage.jsx` — calls `ensureBoot` on mount

---

## QC Checklist

- [ ] Open the app — navigate to **Main page first**
- [ ] Open browser dev tools → Network tab
- [ ] **Key test:** On initial load (Main page), there should be NO requests to `yahoo.com`, `allorigins.win`, `corsproxy.io`, etc.
- [ ] Now click the **Market** tab in the nav
- [ ] CORS proxy requests should NOW appear (first visit triggers the fetch)
- [ ] Market data loads within 15 seconds of arriving on the Market tab
- [ ] If you navigate away and back to Market, it uses cached data (no second fetch within 15 minutes)
- [ ] `refreshMarket` button (pull-to-refresh or manual) still forces a new fetch
- [ ] No console error: `ensureBoot is not a function`

---

## Do NOT change
- Cache TTL (15 minutes) — leave as is
- Any market data parsing or display logic
- `src/services/indianMarketService.js` (that's Agent 02/03)
