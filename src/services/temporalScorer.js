/**
 * temporalScorer.js — Exponential time-decay freshness scorer.
 *
 * Replaces hard freshness cut-offs with smooth decay:
 *   weight = e^(-λ × age_hours)   where λ = ln(2) / HALF_LIFE_HOURS
 *
 * With HALF_LIFE = 6h:
 *   0h   → weight 1.00  (no penalty)
 *   6h   → weight 0.50  (half weight)
 *   12h  → weight 0.25
 *   24h  → weight 0.06  (significant decay, but not zero)
 *   48h  → weight 0.004 (effectively zero for most scores)
 *
 * A high-impact story (score 9) at 24h: 9 × 0.06 = 0.54
 * A mediocre story  (score 2) at  1h: 2 × 0.88 = 1.76  ← correctly wins
 * Tune HALF_LIFE_HOURS to change the decay curve.
 */

/**
 * @param {number} baseScore       Raw impact/relevance score (e.g. 0–10)
 * @param {number} publishedAt     Unix timestamp in milliseconds
 * @param {number} [now]           Override for unit testing
 * @param {number} [halfLifeHours] Optional override for half life hours (default: 6)
 * @returns {number}               Time-decayed score (always >= 0)
 */
export function temporalScore(baseScore, publishedAt, now = Date.now(), halfLifeHours = 6) {
  if (!publishedAt || isNaN(publishedAt)) return baseScore * 0.1; // treat unknown age as stale
  const lambda = Math.LN2 / halfLifeHours;
  const ageHours = Math.max(0, now - publishedAt) / 3_600_000;
  return baseScore * Math.exp(-lambda * ageHours);
}

/**
 * Re-rank an array of articles by decayed score. Non-destructive.
 * @param {Array<{impactScore?: number, publishedAt: number}>} articles
 * @param {number} [halfLifeHours] Optional override for half life hours
 * @returns {Array} Sorted highest temporal-score first
 */
export function rankByTemporalScore(articles, halfLifeHours = 6) {
  return [...articles].sort((a, b) =>
    temporalScore(b.impactScore || 0, b.publishedAt, Date.now(), halfLifeHours) -
    temporalScore(a.impactScore || 0, a.publishedAt, Date.now(), halfLifeHours)
  );
}
