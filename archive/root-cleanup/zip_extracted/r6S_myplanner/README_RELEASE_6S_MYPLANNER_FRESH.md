# Release 6S — MyPlannerPage ViewModel Binding

Fresh implementation based on the current repo contracts.

## Files included

- `src/viewModels/useMyPlannerPageViewModel.js`
- `src/pages/MyPlannerPage.jsx`
- `src/pages/MyPlannerPage.release6S.cert.test.jsx`
- `scripts/test_hardening_release6S_static.mjs`

## Important implementation choices

- `MyPlannerPage.jsx` no longer imports planner storage or planner service modules.
- `makePlannerSelectionKey()` remains inside the ViewModel only.
- The ViewModel projects `plannerSelectionKey` and `plannerSelected` onto grouped planner items.
- Calendar export stays supported:
  - single item calendar export remains in `SwipeableItem`
  - inspector/bulk calendar export is owned by the ViewModel
- Undo timers and copy-status timers are cleared on unmount.

## Package scripts

```json
"test:hardening:release6S": "node scripts/test_hardening_release6S_static.mjs",
"test:myplanner-binding": "vitest run --config vitest.config.js src/pages/MyPlannerPage.release6S.cert.test.jsx"
```

## Commands

```bash
npm run test:hardening:release6S
npm run test:myplanner-binding
npx vite build
npm run test:unit
git diff --name-only
git diff package.json
```
