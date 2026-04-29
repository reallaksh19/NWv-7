# WI — Agent 06: Insight — Fix Child Story Display
**Sequence:** 6 of 10
**Prerequisite:** Agent 05 complete (pipeline must produce clusters first)
**Estimated changes:** ~40 lines in 1 file

---

## Objective
When expanding an Insight card, Child Stories section shows raw IDs like `ddg-3`, `rss-7` instead of actual headlines. Fix so it shows readable story titles and source names.

---

## Context
- File: `src/pages/InsightPage.jsx`
- The `ICard` component (line 8) receives a `story` prop which has `childStoryIds` (array of string IDs)
- The `InsightTab` component (line 64) has access to `result` which contains the full `parents` array
- The pipeline result from `runInsightPipeline` returns `{ parents: [...] }` where each parent has `clusterStoryIds` and `childStoryIds`
- The full story objects are in `result.allStories` (if present) or can be reconstructed from the `parents` data

---

## File: `src/pages/InsightPage.jsx`

### Change 1 of 2: Update `InsightTab` to build a story lookup map and pass it down

**BEFORE (lines 64–109):**
```javascript
function InsightTab({ result }) {
  const parents = result?.parents || [];

  return (
    <div className="scroll insight-page">
      {/* ... signal ring and stats ... */}
      {parents.map((p, i) => <ICard key={p.parentId} story={p} index={i} />)}
    </div>
  );
}
```

**AFTER — find line 64–65 and replace just those 2 lines:**
```javascript
function InsightTab({ result }) {
  const parents = result?.parents || [];

  // Build a lookup map: storyId -> story object
  // Each parent itself is a story; cluster members reference other parents by ID
  const storyMap = {};
  parents.forEach(p => {
    storyMap[p.parentId] = p;
    // Also index by any cluster IDs this parent claims
    (p.clusterStoryIds || []).forEach(id => {
      if (!storyMap[id]) storyMap[id] = p;
    });
  });
```

Then find the map call at line 106:
```javascript
{parents.map((p, i) => <ICard key={p.parentId} story={p} index={i} />)}
```
Replace with:
```javascript
{parents.map((p, i) => <ICard key={p.parentId} story={p} index={i} storyMap={storyMap} />)}
```

---

### Change 2 of 2: Update `ICard` to use `storyMap` for child story resolution

**BEFORE (line 8 — function signature):**
```javascript
function ICard({ story, index }) {
```

**AFTER:**
```javascript
function ICard({ story, index, storyMap = {} }) {
```

**BEFORE (lines 44–55 — the child stories rendering block):**
```jsx
<div className="exp-block">
  <div className="exp-label"><span className="dot" style={{ background: 'var(--warn, #F0883E)' }} />Child Stories</div>
  <div className="src-list">
    {story.childStoryIds.length === 0 ? (
       <p className="ctxt">No diverse child stories found.</p>
    ) : (
       story.childStoryIds.map((childId, i) => (
          <div key={i} className="src-item">
            <span className="sname">Child {i+1}</span>
            <span className="sdesc">{childId}</span>
            <span className="ang diff">Sub-angle</span>
          </div>
       ))
    )}
  </div>
</div>
```

**AFTER (replace the entire block above):**
```jsx
<div className="exp-block">
  <div className="exp-label"><span className="dot" style={{ background: 'var(--warn, #F0883E)' }} />Related Angles</div>
  <div className="src-list">
    {(story.childStoryIds || []).length === 0 ? (
       <p className="ctxt">No diverse child stories found.</p>
    ) : (
       story.childStoryIds.map((childId, i) => {
          // Resolve the child ID to a real story object if available
          const child = storyMap[childId];
          const headline = child?.canonicalHeadline || child?.title || childId;
          const source = child?.clusterStoryIds?.[0]?.split('-')[0] || 'Source';
          return (
            <div key={i} className="src-item">
              <span className="sname">{source}</span>
              <span className="sdesc">{headline}</span>
              <span className="ang diff">Angle {i + 1}</span>
            </div>
          );
       })
    )}
  </div>
</div>
```

---

## Deliverable
- `src/pages/InsightPage.jsx` — `ICard` and `InsightTab` updated

---

## QC Checklist

- [ ] Navigate to Insight tab (`/insight`)
- [ ] Wait for clusters to load
- [ ] Click the `+` button on any cluster card to expand it
- [ ] **Key test:** Under "Related Angles", stories show readable headlines like "India cuts interest rate to..." — NOT raw IDs like `ddg-3`
- [ ] If a child story's data is not available, it shows the ID as fallback (not crash)
- [ ] Source column shows a recognizable source name, not a raw prefix
- [ ] "Angle 1", "Angle 2" labels appear next to each child story
- [ ] No console error: `Cannot read properties of undefined (reading 'split')`

---

## Do NOT change
- The signal ring SVG (lines 71–84)
- The stats strip (lines 95–101)
- `EmptyState` component
- `InsightPage` default export function
- Any CSS or style files
