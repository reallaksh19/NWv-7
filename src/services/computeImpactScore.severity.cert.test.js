import { describe, expect, it } from 'vitest';
import { computeImpactScore } from './rssAggregator.js';

const base = (title, description = '') => ({
  id: title,
  title,
  description,
  publishedAt: Date.now() - 30 * 60 * 1000, // 30 min ago (very fresh)
  source: 'BBC',
});

describe('computeImpactScore — headline regression (RC-1/RC-3/RC-4 fix)', () => {
  it('a casualty war story outranks a same-age game trailer', () => {
    const warScore = computeImpactScore(
      base('Iran missile strike kills dozens in Gulf', 'West Asia war ongoing'),
      'world',
      0,
      { enableNewScoring: true, rankingMode: 'smart' },
    );
    const gameScore = computeImpactScore(
      base('God of War Laufey gameplay trailer revealed', 'Revealed at State of Play'),
      'technology',
      0,
      { enableNewScoring: true, rankingMode: 'smart' },
    );
    expect(warScore).toBeGreaterThan(gameScore);
  });
});
