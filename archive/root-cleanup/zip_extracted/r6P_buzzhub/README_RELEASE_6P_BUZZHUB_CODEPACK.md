# Release 6P Buzz Hub / TechSocial Code Pack

This corrected 6P pack preserves the existing Buzz Hub UI contract:

- Entertainment tabs: Tamil / Hindi / H'wood / OTT
- `masonry-grid` layout
- `ImageCard` with `article`, `href`, `badge`, `size` props
- Regional social trends: World / India / Tamil Nadu / Muscat
- Existing `NewsSection` usage style
- Legacy `buzz_page_cache` compatibility

Files included:

- `src/viewModels/useTechSocialPageViewModel.js`
- `src/pages/TechSocialPage.jsx`
- `scripts/test_hardening_release6P_static.mjs`
- `src/pages/TechSocialPage.release6P.cert.test.jsx`

Package scripts to add:

```json
"test:hardening:release6P": "node scripts/test_hardening_release6P_static.mjs",
"test:techsocial-binding": "vitest run --config vitest.config.js src/pages/TechSocialPage.release6P.cert.test.jsx"
```

Required commands:

```bash
npm run test:hardening:release6O
npm run test:refreshpage-binding

npm run test:hardening:release6P
npm run test:techsocial-binding

npx vite build
npm run test:unit
```
