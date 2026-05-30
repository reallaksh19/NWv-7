import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  __techSocialPageViewModelInternalsForTest,
} from '../viewModels/useTechSocialPageViewModel.js';

const read = path => fs.readFileSync(path, 'utf8');

function hasHookCall(content, name) {
  return new RegExp(`\\b${name}\\s*\\(`).test(content);
}

describe('Release 6P TechSocial / Buzz Hub binding', () => {
  const page = read('src/pages/TechSocialPage.jsx');
  const vm = read('src/viewModels/useTechSocialPageViewModel.js');

  it('TechSocialPage no longer owns News/Settings contexts', () => {
    expect(page).not.toContain("from '../context/NewsContext'");
    expect(page).not.toContain("from '../context/SettingsContext'");
    expect(hasHookCall(page, 'useNews')).toBe(false);
    expect(hasHookCall(page, 'useSettings')).toBe(false);
    expect(page).toContain('useTechSocialPageViewModel');
  });

  it('TechSocialPage no longer owns cache or refresh orchestration', () => {
    expect(page).not.toContain('localStorage.setItem');
    expect(page).not.toContain('localStorage.getItem');
    expect(page).not.toContain('refreshNews([');
    expect(page).not.toContain('filterOldNews(');
  });

  it('TechSocialPage keeps Header shell runtime binding', () => {
    expect(page).toContain('useShellRuntimeProps');
    expect(page).toContain('shellRuntimeProps={shellRuntimeProps}');
  });

  it('TechSocialPage preserves entertainment tabs and masonry layout', () => {
    expect(page).toContain('entertainment-tabs');
    expect(page).toContain('activeEntTab');
    expect(page).toContain('setActiveEntTab');
    expect(page).toContain('masonry-grid');
  });

  it('TechSocialPage uses ImageCard with the current article prop contract', () => {
    expect(page).toContain('article={{');
    expect(page).toContain('href={item.link || item.url}');
    expect(page).not.toContain('story={story}');
    expect(page).not.toContain('story={');
  });

  it('TechSocial ViewModel owns Buzz cache, projection and refresh', () => {
    [
      'safeReadBuzzCache',
      'safeWriteBuzzCache',
      'projectEntertainmentStories',
      'projectTechnologyStories',
      'projectAiInnovationStories',
      'distributeSocialTrends',
      'refreshNews(BUZZ_REQUIRED_SECTIONS)',
    ].forEach(token => {
      expect(vm).toContain(token);
    });
  });

  it('TechSocial ViewModel preserves legacy Buzz cache compatibility', () => {
    expect(vm).toContain('buzz_page_cache');
    expect(vm).toContain('timestamp');
    expect(vm).toContain('data');
  });

  it('publishedAt parser supports ms, seconds and ISO strings', () => {
    const { getPublishedAtMs } = __techSocialPageViewModelInternalsForTest;

    expect(getPublishedAtMs(1_700_000_000_000)).toBe(1_700_000_000_000);
    expect(getPublishedAtMs(1_700_000_000)).toBe(1_700_000_000_000);
    expect(getPublishedAtMs('2026-05-29T00:00:00Z')).toBeGreaterThan(0);
  });

  it('hasBuzzLiveData detects any loaded Buzz section', () => {
    const { hasBuzzLiveData } = __techSocialPageViewModelInternalsForTest;

    expect(hasBuzzLiveData({ technology: [{ title: 'x' }] })).toBe(true);
    expect(hasBuzzLiveData({ entertainment: [] })).toBe(false);
    expect(hasBuzzLiveData({ social: [{ title: 'x' }] })).toBe(true);
  });

  it('entertainment projection preserves regional tab contract', () => {
    const { projectEntertainmentStories } = __techSocialPageViewModelInternalsForTest;

    const stories = projectEntertainmentStories({
      entertainment: [
        {
          title: 'New Vijay Tamil cinema update',
          publishedAt: '2026-05-29T00:00:00Z',
        },
        {
          title: 'Netflix launches new web series',
          publishedAt: '2026-05-29T00:00:00Z',
        },
      ],
    });

    expect(stories.some(story => story.region === 'tamil')).toBe(true);
    expect(stories.some(story => story.region === 'ott')).toBe(true);
  });

  it('social trend projection preserves regional distribution', () => {
    const { distributeSocialTrends } = __techSocialPageViewModelInternalsForTest;

    const trends = distributeSocialTrends({
      social: [
        { title: 'Viral Chennai Tamil trend', publishedAt: '2026-05-29T00:00:00Z' },
        { title: 'Global viral social debate', publishedAt: '2026-05-29T00:00:00Z' },
      ],
    });

    expect(trends.some(story => story.region === 'tamilnadu')).toBe(true);
    expect(trends.some(story => story.region === 'world')).toBe(true);
  });

  it('AI projection finds AI stories from technology section', () => {
    const { projectAiInnovationStories } = __techSocialPageViewModelInternalsForTest;

    const stories = projectAiInnovationStories({
      technology: [
        {
          title: 'OpenAI launches new AI agent',
          publishedAt: '2026-05-29T00:00:00Z',
        },
      ],
    });

    expect(stories).toHaveLength(1);
  });
});
