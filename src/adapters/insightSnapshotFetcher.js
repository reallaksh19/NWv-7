/**
 * insightSnapshotFetcher.js
 *
 * Loads the pre-fetched Insight snapshot from public/newsdata/insight_latest.json
 * and produces a SlotFetcher-compatible function that filters stories by current age
 * (Date.now() - publishedAt) rather than the Python fetch slot — so a story
 * fetched at 6 am naturally becomes a "minus4h" story at 10 am without any
 * re-fetch.
 *
 * Golden rules enforced here:
 *  - slotMeta is NEVER used for display; only stories[] is consumed.
 *  - minus24h upper bound: 24 h ≤ age < 36 h  (not unlimited).
 *  - Stale snapshot is used as-is (no live fallback on static host).
 */

const H = 3_600_000;
const FRESH_MAX_AGE_MS = 8 * H; // snapshot file age — covers IST night gap between hourly runs

const SNAPSHOT_URL = (() => {
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  return `${base}/newsdata/insight_latest.json`;
})();

/**
 * Fetch and validate the snapshot file.
 * @param {object} [options]
 * @param {boolean} [options.allowStale=false]  If false, returns null when file age > 3h.
 * @returns {Promise<object|null>}
 */
export async function loadInsightSnapshot({ allowStale = false } = {}) {
  try {
    const res = await fetch(SNAPSHOT_URL, { cache: 'no-cache' });
    if (!res.ok) return null;
    const snapshot = await res.json();
    if (snapshot?.schemaVersion !== 2) return null;
    if (!Array.isArray(snapshot?.stories)) return null;
    const age = Date.now() - Number(snapshot.fetchedAt || 0);
    if (!allowStale && age > FRESH_MAX_AGE_MS) return null;
    return snapshot;
  } catch {
    return null;
  }
}

/**
 * Build a SlotFetcher from a snapshot.
 * The fetcher filters the flat stories[] pool by current story age at call time,
 * so the same snapshot remains useful for many hours.
 *
 * @param {object} snapshot  A valid schemaVersion-2 snapshot object.
 * @returns {(slot: string) => Promise<object[]>}
 */
export function createSnapshotRawFetcher(snapshot) {
  const pool = snapshot?.stories ?? [];

  const filters = {
    now:      (s) => { const a = Date.now() - Number(s.publishedAt || 0); return a >= 0 && a < 4 * H; },
    minus4h:  (s) => { const a = Date.now() - Number(s.publishedAt || 0); return a >= 4 * H && a < 12 * H; },
    minus12h: (s) => { const a = Date.now() - Number(s.publishedAt || 0); return a >= 12 * H && a < 24 * H; },
    minus24h: (s) => { const a = Date.now() - Number(s.publishedAt || 0); return a >= 24 * H && a < 36 * H; },
  };

  return async (slot) => {
    const filtered = pool.filter(filters[slot] ?? (() => false));
    // If the `now` bucket is empty (snapshot is a few hours old), fall back to
    // the freshest minus4h stories so the pipeline always has something to cluster.
    if (slot === 'now' && filtered.length === 0) {
      return pool
        .filter(filters.minus4h)
        .sort((a, b) => Number(b.publishedAt) - Number(a.publishedAt))
        .slice(0, 12);
    }
    return filtered;
  };
}
