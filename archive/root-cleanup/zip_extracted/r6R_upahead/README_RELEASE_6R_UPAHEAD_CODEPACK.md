# Release 6R — UpAheadPage ViewModel Binding

Files included:

- `src/viewModels/useUpAheadPageViewModel.js`
- `src/pages/UpAheadPage.jsx`
- `scripts/test_hardening_release6R_static.mjs`
- `src/pages/UpAheadPage.release6R.cert.test.jsx`

Add package scripts:

```json
"test:hardening:release6R": "node scripts/test_hardening_release6R_static.mjs",
"test:upahead-binding": "vitest run --config vitest.config.js src/pages/UpAheadPage.release6R.cert.test.jsx"
```

Run:

```bash
npm run test:hardening:release6Q
npm run test:newspaper-binding

npm run test:hardening:release6R
npm run test:upahead-binding

npx vite build
npm run test:unit
```
