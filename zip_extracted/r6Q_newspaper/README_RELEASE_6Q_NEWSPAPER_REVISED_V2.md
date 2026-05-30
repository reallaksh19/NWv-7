# Release 6Q — Revised NewspaperPage ViewModel Binding

Review corrections applied:

- `proxyManager` remains forbidden in `NewspaperPage`, but is not required in the ViewModel because it is unused.
- Internal `fetchFallbackRSS` was renamed to `fetchFallbackPaper`.
- `fetchFallbackRSS` is kept only as a compatibility alias.
- `fetchFallbackVirtualPaper()` now clears its timeout.
- `handleGenerateAll()` now uses `try/finally` to always reset `isGeneratingAll`.
- `NewspaperPage` guards `section.articles` with `Array.isArray`.
- Cert test now verifies Tamil summary preference when not translated.

Add scripts:

```json
"test:hardening:release6Q": "node scripts/test_hardening_release6Q_static.mjs",
"test:newspaper-binding": "vitest run --config vitest.config.js src/pages/NewspaperPage.release6Q.cert.test.jsx"
```

Run:

```bash
npm run test:hardening:release6Q
npm run test:newspaper-binding
npx vite build
npm run test:unit
```
