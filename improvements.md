# Suggested Improvements

As per the guidelines, these improvements are suggested but not implemented directly in the codebase to avoid crossing the Agent 09 task boundaries and violating the estimated lines of code constraint (estimated ~35 lines in 2 files) and the "Do NOT change" rules.

1. **Migrate Cache to IndexedDB**: Replace the current `localStorage` caching mechanism in `MarketContext.jsx` with IndexedDB. This will overcome the 5MB size limit of `localStorage`, allowing for larger offline datasets and better performance for structured market data.

2. **Enhance Service Worker for Offline Support**: Expand the existing Service Worker (`public/sw.js` and `src/registerSW.js`) to cache static assets and API responses. The registration is already correctly gated by `import.meta.env.PROD`, but its caching strategies could be improved (e.g., Stale-While-Revalidate) to enable a true offline mode.

3. **Web Worker for Price Alerts**: Implement a dedicated Web Worker to handle periodic fetching and checking of market prices against user-defined thresholds. This would allow the app to trigger price alerts without blocking the main UI thread, ensuring a smooth user experience even during heavy calculations.