# WI — Agent 05: Insight — Fix Pipeline (Embeddings + Slot Fetcher)
**Sequence:** 5 of 10
**Prerequisite:** Agent 01 complete
**Estimated changes:** ~75 lines across 2 files

---

## Objective
The Insight page either shows nothing or shows meaningless clusters because:
1. The embeddings adapter returns fake vectors (all zeros except 2 values) so clustering groups articles by string length, not topic
2. The news fetcher ignores the slot parameter and always queries "latest news" — every slot gets the same articles

Fix both issues using pure JavaScript (no external API required — works on static GitHub Pages).

---

## File 1 of 2: `src/adapters/embeddingsAdapter.js`

**What to do:** Replace the entire file with a TF-IDF based vector implementation.

**BEFORE (entire file — 13 lines):**
```javascript
export async function getEmbeddings(texts) {
  return texts.map(text => {
    const vec = new Array(384).fill(0);
    if (text && text.length > 0) {
      vec[0] = text.length / 1000;
      vec[1] = text.charCodeAt(0) / 255;
    }
    return vec;
  });
}
```

**AFTER (replace entire file with this):**
```javascript
/**
 * TF-IDF based embeddings — no external API needed, works on static GitHub Pages.
 * Produces sparse vectors where each dimension is a word, scored by TF-IDF weight.
 * Good enough for clustering similar news stories by topic.
 */

const STOP_WORDS = new Set([
  'a','an','and','are','as','at','be','been','but','by','for','from',
  'has','have','he','her','his','how','i','in','is','it','its','not',
  'of','on','or','she','so','than','that','the','their','they','this',
  'to','up','was','we','were','what','when','which','who','will','with'
]);

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

function computeTF(tokens) {
  const freq = {};
  tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
  const total = tokens.length || 1;
  Object.keys(freq).forEach(t => { freq[t] = freq[t] / total; });
  return freq;
}

export async function getEmbeddings(texts) {
  if (!texts || texts.length === 0) return [];

  // Step 1: tokenize all texts
  const tokenized = texts.map(tokenize);

  // Step 2: compute IDF across corpus
  const dfCounts = {};
  tokenized.forEach(tokens => {
    const unique = new Set(tokens);
    unique.forEach(t => { dfCounts[t] = (dfCounts[t] || 0) + 1; });
  });
  const N = texts.length;
  const idf = {};
  Object.keys(dfCounts).forEach(t => {
    idf[t] = Math.log(N / (dfCounts[t] + 1)) + 1;
  });

  // Step 3: build vocabulary (top 200 terms by IDF to keep vectors manageable)
  const vocab = Object.keys(idf)
    .sort((a, b) => idf[b] - idf[a])
    .slice(0, 200);

  // Step 4: for each text, build a 200-dim TF-IDF vector
  return tokenized.map(tokens => {
    const tf = computeTF(tokens);
    return vocab.map(term => (tf[term] || 0) * (idf[term] || 0));
  });
}
```

---

## File 2 of 2: `src/adapters/newsFetcher.js`

**What to do:** Make `fetchStoriesForSlot` use the slot name to build a relevant query.

**BEFORE (lines 4–21):**
```javascript
export async function fetchStoriesForSlot(slot) {
  const news = await fetchNews('latest news', { newsApiKey: '' });
  if (!news || !Array.isArray(news)) {
    return [];
  }
  return news.map(article => ({
    id: article.id || Math.random().toString(36).substring(7),
    title: article.headline || '',
    summary: article.summary || '',
    content: article.summary || '',
    url: article.url || '',
    publishedAt: article.time ? new Date().toISOString() : new Date().toISOString(),
    source: article.source || 'Unknown',
    sourceGroup: 'digital'
  }));
}
```

**AFTER (replace the function body, keep `/* eslint-disable */` and import):**
```javascript
// Maps slot names to specific search queries for more relevant news fetching
const SLOT_QUERIES = {
  world:         'world news top stories today',
  india:         'India news today top stories',
  business:      'India business economy markets today',
  technology:    'technology startups AI innovation India',
  entertainment: 'bollywood movies entertainment India',
  sports:        'cricket IPL football sports India',
  local:         'Chennai Tamil Nadu Trichy news today',
  chennai:       'Chennai news today',
  trichy:        'Trichy Tiruchirappalli news',
};

export async function fetchStoriesForSlot(slot) {
  const query = SLOT_QUERIES[slot] || `${slot} news today`;
  const news = await fetchNews(query, { newsApiKey: '' });
  if (!news || !Array.isArray(news)) {
    return [];
  }
  return news.map(article => ({
    id: article.id || Math.random().toString(36).substring(7),
    title: article.headline || article.title || '',
    summary: article.summary || article.description || '',
    content: article.summary || article.description || '',
    url: article.url || article.link || '',
    publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
    source: article.source || 'Unknown',
    sourceGroup: 'digital'
  }));
}
```

---

## Deliverable
- `src/adapters/embeddingsAdapter.js` — entire file replaced with TF-IDF implementation
- `src/adapters/newsFetcher.js` — `fetchStoriesForSlot` updated with slot-specific queries

---

## QC Checklist

- [ ] Navigate to Insight tab (`/insight`)
- [ ] Loading spinner appears ("Running AI pipeline…")
- [ ] After 10–30 seconds, clusters appear (list of ranked cards)
- [ ] **Key test:** Two articles about "India budget" and "India economy" should cluster together
- [ ] **Key test:** An article about "cricket match" should NOT cluster with "India budget"
- [ ] Clusters show a meaningful headline (not blank or undefined)
- [ ] The signal stats strip shows numbers > 0 for Ranked, Rising, Stories
- [ ] No console errors: `Cannot read property ... of undefined` or `NaN`
- [ ] If no clusters found, the empty state shows: "No Insights Available" (not a crash)

---

## Do NOT change
- `src/adapters/insightFetcher.js`
- `src/adapters/nlpAdapter.js`
- Any files in `src/insight/src/`
- `src/pages/InsightPage.jsx` — that is Agent 06's job
