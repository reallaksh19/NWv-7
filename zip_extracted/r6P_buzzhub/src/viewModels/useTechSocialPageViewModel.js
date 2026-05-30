/* eslint-disable */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNews } from '../context/NewsContext';
import { useSettings } from '../context/SettingsContext';

export const BUZZ_PAGE_CACHE_KEY = 'buzz_page_cache';
const BUZZ_CACHE_NEXT_KEY = 'nw_buzz_hub_cache_v1';
const BUZZ_CACHE_MAX_AGE_MS = 8 * 60 * 60 * 1000;

export const BUZZ_REQUIRED_SECTIONS = [
  'entertainment',
  'social',
  'technology',
  'local',
  'world',
  'india',
  'chennai',
];

const ENTERTAINMENT_KEYWORDS = {
  tamil: [
    'vijay', 'ajith', 'rajini', 'kamal', 'dhanush', 'suriya', 'vikram', 'simbu',
    'siva karthikeyan', 'trisha', 'nayanthara', 'anirudh', 'ar rahman', 'kollywood',
    'thalapathy', 'thala', 'udhayanidhi', 'vetri maaran', 'lokesh', 'nelson',
    'jailer', 'leo', 'kanguva', 'indian 2', 'vettaiyan', 'goat', 'viduthalai',
    'karthi', 'sethupathi', 'tamil', 'chennai',
  ],
  hindi: [
    'shah rukh', 'srk', 'salman', 'aamir', 'ranbir', 'alia', 'deepika', 'ranveer',
    'kareena', 'akshay', 'bachchan', 'bollywood', 'hrithik', 'katrina', 'vicky kaushal',
    'karan johar', 'yrf', 'dharma', 'pathaan', 'jawan', 'tiger 3', 'animal', 'dunki',
    'war 2', 'singham', 'hindi', 'mumbai',
  ],
  hollywood: [
    'oscar', 'grammy', 'emmy', 'golden globe', 'marvel', 'dc', 'disney', 'warner bros',
    'universal', 'tom cruise', 'dicaprio', 'nolan', 'avengers', 'spider-man', 'batman',
    'superman', 'taylor swift', 'beyonce', 'kim kardashian', 'kanye', 'justin bieber',
    'selena gomez', 'zendaya', 'hollywood', 'bad bunny', 'rihanna', 'drake',
  ],
  ott: [
    'netflix', 'prime video', 'hotstar', 'sonyliv', 'zee5', 'aha', 'streaming',
    'web series', 'season', 'episode', 'ott',
  ],
};

const REGION_KEYWORDS = {
  world: ['global', 'world', 'international', 'usa', 'europe', 'uk', 'china', 'twitter', 'x.com', 'meta', 'tiktok', 'instagram', 'viral'],
  india: ['india', 'indian', 'bollywood', 'cricket', 'modi', 'delhi', 'mumbai', 'bangalore', 'hyderabad', 'ipl', 'bcci'],
  tamilnadu: ['chennai', 'tamil', 'tamilnadu', 'kollywood', 'rajini', 'kamal', 'vijay', 'trichy', 'coimbatore', 'madurai', 'tn'],
  muscat: ['muscat', 'oman', 'gulf', 'gcc', 'uae', 'dubai', 'arab', 'middle east', 'expat', 'omani'],
};

const AI_KEYWORDS = [
  'ai',
  'artificial intelligence',
  'innovation',
  'machine learning',
  'chatgpt',
  'gemini',
  'openai',
  'claude',
  'llm',
  'generative ai',
  'robot',
  'automation',
  'agent',
  'copilot',
];

export const NAV_SECTIONS = [
  { id: 'entertainment', icon: '🎬', label: 'Entertainment' },
  { id: 'social-trends', icon: '👥', label: 'Social Trends' },
  { id: 'tech-news', icon: '🚀', label: 'Tech & Startups' },
  { id: 'ai-innovation', icon: '🤖', label: 'AI & Innovation' },
];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : {};
}

function getStoryText(story) {
  return [
    story?.title,
    story?.headline,
    story?.summary,
    story?.description,
    story?.source,
    story?.category,
    story?.section,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function getPublishedAtMs(value) {
  if (value == null) return 0;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value < 10_000_000_000 ? value * 1000 : value;
  }

  const numeric = Number(value);

  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric < 10_000_000_000 ? numeric * 1000 : numeric;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getStoryTimeMs(story) {
  return getPublishedAtMs(story?.publishedAt || story?.timestamp || story?.date || story?.pubDate);
}

function filterOldNews(newsArray, freshnessLimitHours = 72) {
  const limitMs = Number(freshnessLimitHours || 72) * 3600000;
  const now = Date.now();

  return asArray(newsArray).filter(item => {
    const publishedAtMs = getStoryTimeMs(item);
    if (!publishedAtMs) return true;
    return now - publishedAtMs < limitMs;
  });
}

function sortNewestFirst(stories) {
  return [...asArray(stories)].sort((a, b) => getStoryTimeMs(b) - getStoryTimeMs(a));
}

function uniqueByStory(stories) {
  const seen = new Set();

  return asArray(stories).filter(story => {
    const key = story?.id ||
      story?.url ||
      story?.link ||
      `${story?.title || story?.headline || ''}-${story?.source || ''}`;

    if (!key) return false;
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function hasBuzzLiveData(newsData) {
  const safeNewsData = asRecord(newsData);

  return BUZZ_REQUIRED_SECTIONS.some(section => (
    asArray(safeNewsData[section]).length > 0
  ));
}

function normalizeBuzzCachePayload(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;

  const savedAt = Number(parsed.savedAt || parsed.timestamp || 0);
  const data = asRecord(parsed.newsData || parsed.data);

  if (!savedAt || Object.keys(data).length === 0) return null;
  if (Date.now() - savedAt > BUZZ_CACHE_MAX_AGE_MS) return null;

  return {
    savedAt,
    timestamp: savedAt,
    data,
    newsData: data,
  };
}

function safeReadBuzzCache() {
  try {
    if (typeof window === 'undefined') return null;

    const storage = window.localStorage;
    if (!storage || typeof storage.getItem !== 'function') return null;

    const keys = [BUZZ_CACHE_NEXT_KEY, BUZZ_PAGE_CACHE_KEY];

    for (const key of keys) {
      const raw = storage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      const normalized = normalizeBuzzCachePayload(parsed);

      if (normalized) return normalized;
    }

    return null;
  } catch {
    return null;
  }
}

function safeWriteBuzzCache(newsData) {
  try {
    if (typeof window === 'undefined') return false;

    const storage = window.localStorage;
    if (!storage || typeof storage.setItem !== 'function') return false;

    const data = {
      entertainment: asArray(newsData?.entertainment),
      social: asArray(newsData?.social),
      technology: asArray(newsData?.technology),
      world: asArray(newsData?.world),
      india: asArray(newsData?.india),
      chennai: asArray(newsData?.chennai),
      local: asArray(newsData?.local),
    };

    const legacyPayload = {
      timestamp: Date.now(),
      data,
    };

    const nextPayload = {
      savedAt: legacyPayload.timestamp,
      newsData: data,
    };

    storage.setItem(BUZZ_PAGE_CACHE_KEY, JSON.stringify(legacyPayload));
    storage.setItem(BUZZ_CACHE_NEXT_KEY, JSON.stringify(nextPayload));

    return true;
  } catch {
    return false;
  }
}

function classifyEntertainmentRegion(story) {
  const text = getStoryText(story);

  if (ENTERTAINMENT_KEYWORDS.tamil.some(keyword => text.includes(keyword))) return 'tamil';
  if (ENTERTAINMENT_KEYWORDS.hindi.some(keyword => text.includes(keyword))) return 'hindi';
  if (ENTERTAINMENT_KEYWORDS.hollywood.some(keyword => text.includes(keyword))) return 'hollywood';
  if (ENTERTAINMENT_KEYWORDS.ott.some(keyword => text.includes(keyword))) return 'ott';

  return story?.region || 'tamil';
}

function projectEntertainmentStories(newsData, freshnessLimitHours = 72) {
  const raw = asArray(asRecord(newsData).entertainment);

  return sortNewestFirst(
    filterOldNews(raw, freshnessLimitHours)
      .map(item => ({
        ...item,
        region: classifyEntertainmentRegion(item),
      }))
  );
}

function categorizeSocialRegion(newsItem) {
  const text = getStoryText(newsItem);

  if (REGION_KEYWORDS.tamilnadu.some(keyword => text.includes(keyword))) return 'tamilnadu';
  if (REGION_KEYWORDS.muscat.some(keyword => text.includes(keyword))) return 'muscat';
  if (REGION_KEYWORDS.india.some(keyword => text.includes(keyword))) return 'india';

  return 'world';
}

function isTrendStory(story) {
  const title = String(story?.title || story?.headline || '').toLowerCase();
  return (
    title.includes('trend') ||
    title.includes('viral') ||
    title.includes('social')
  );
}

function getSocialDistribution(settings) {
  return {
    world: settings?.socialTrends?.worldCount ?? 8,
    india: settings?.socialTrends?.indiaCount ?? 8,
    tamilnadu: settings?.socialTrends?.tamilnaduCount ?? 5,
    muscat: settings?.socialTrends?.muscatCount ?? 4,
  };
}

function getRegionLabel(region) {
  if (region === 'world') return '🌍 World';
  if (region === 'india') return '🇮🇳 India';
  if (region === 'tamilnadu') return '🏛️ Tamil Nadu';
  return '🏝️ Muscat';
}

function distributeSocialTrends(newsData, settings = {}, freshnessLimitHours = 72) {
  const safeData = asRecord(newsData);

  const allSocial = filterOldNews(safeData.social, freshnessLimitHours);
  const worldNews = filterOldNews(safeData.world, freshnessLimitHours);
  const indiaNews = filterOldNews(safeData.india, freshnessLimitHours);
  const chennaiNews = filterOldNews(safeData.chennai, freshnessLimitHours);
  const localNews = filterOldNews(safeData.local, freshnessLimitHours);

  const regionBuckets = {
    world: [],
    india: [],
    tamilnadu: [],
    muscat: [],
  };

  allSocial.forEach(item => {
    const region = categorizeSocialRegion(item);
    regionBuckets[region].push({ ...item, source: item.source || 'social' });
  });

  worldNews
    .filter(isTrendStory)
    .forEach(item => regionBuckets.world.push({ ...item, source: item.source || 'world' }));

  indiaNews
    .filter(isTrendStory)
    .forEach(item => regionBuckets.india.push({ ...item, source: item.source || 'india' }));

  chennaiNews.forEach(item => {
    regionBuckets.tamilnadu.push({ ...item, source: item.source || 'chennai' });
  });

  localNews.forEach(item => {
    regionBuckets.muscat.push({ ...item, source: item.source || 'local' });
  });

  const distribution = getSocialDistribution(settings);
  const result = [];

  Object.entries(distribution).forEach(([region, count]) => {
    const bucket = sortNewestFirst(regionBuckets[region]);
    const toAdd = bucket.slice(0, count);

    toAdd.forEach(item => {
      result.push({
        ...item,
        region,
        regionLabel: getRegionLabel(region),
      });
    });
  });

  return sortNewestFirst(uniqueByStory(result));
}

function projectTechnologyStories(newsData, freshnessLimitHours = 72) {
  return sortNewestFirst(
    filterOldNews(asRecord(newsData).technology, freshnessLimitHours)
  );
}

function projectAiInnovationStories(newsData, freshnessLimitHours = 72) {
  return sortNewestFirst(
    filterOldNews(asRecord(newsData).technology, freshnessLimitHours)
      .filter(item => {
        const text = getStoryText(item);
        return AI_KEYWORDS.some(keyword => text.includes(keyword));
      })
  );
}

function getFreshnessLimitHours(settings) {
  const value =
    settings?.freshnessLimitHours ??
    settings?.buzz?.freshnessLimitHours ??
    settings?.display?.freshnessLimitHours ??
    settings?.news?.freshnessLimitHours ??
    72;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 72;
}

function getTechnologyMaxDisplay(settings) {
  const value =
    settings?.sections?.technology?.count ??
    settings?.buzz?.technologyMaxDisplay ??
    settings?.techSocial?.technologyMaxDisplay ??
    5;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
}

export function useTechSocialPageViewModel() {
  const {
    newsData,
    refreshNews,
    loading: contextLoading,
    loadSection,
  } = useNews();

  const { settings } = useSettings();

  const [activeEntTab, setActiveEntTab] = useState('tamil');
  const [cachedData, setCachedData] = useState(null);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const freshnessLimitHours = useMemo(() => (
    getFreshnessLimitHours(settings)
  ), [settings]);

  const technologyMaxDisplay = useMemo(() => (
    getTechnologyMaxDisplay(settings)
  ), [settings]);

  useEffect(() => {
    const cached = safeReadBuzzCache();

    if (cached) {
      setCachedData(cached);
      setLoadingPhase(1);
    }
  }, []);

  useEffect(() => {
    BUZZ_REQUIRED_SECTIONS.forEach(section => {
      try {
        if (typeof loadSection === 'function') {
          loadSection(section);
        }
      } catch (error) {
        console.warn('[useTechSocialPageViewModel] loadSection failed', {
          section,
          message: error?.message || String(error),
        });
      }
    });
  }, [loadSection]);

  const hasLiveData = useMemo(() => (
    hasBuzzLiveData(newsData)
  ), [newsData]);

  useEffect(() => {
    if (hasLiveData) {
      setLoadingPhase(3);
      safeWriteBuzzCache(newsData);
    }
  }, [hasLiveData, newsData]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const displayData = useMemo(() => (
    hasLiveData
      ? asRecord(newsData)
      : asRecord(cachedData?.data || cachedData?.newsData)
  ), [cachedData, hasLiveData, newsData]);

  const processedEntertainment = useMemo(() => (
    projectEntertainmentStories(displayData, freshnessLimitHours)
  ), [displayData, freshnessLimitHours]);

  const visibleEntertainment = useMemo(() => (
    processedEntertainment.filter(item => item.region === activeEntTab)
  ), [activeEntTab, processedEntertainment]);

  const socialTrends = useMemo(() => (
    distributeSocialTrends(displayData, settings, freshnessLimitHours)
  ), [displayData, freshnessLimitHours, settings]);

  const technologyStories = useMemo(() => (
    projectTechnologyStories(displayData, freshnessLimitHours)
  ), [displayData, freshnessLimitHours]);

  const aiInnovationStories = useMemo(() => (
    projectAiInnovationStories(displayData, freshnessLimitHours)
  ), [displayData, freshnessLimitHours]);

  const handleRefresh = useCallback(() => {
    setLoadingPhase(3);

    if (typeof refreshNews === 'function') {
      return refreshNews(BUZZ_REQUIRED_SECTIONS);
    }

    return null;
  }, [refreshNews]);

  const scrollToTop = useCallback(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return {
    activeEntTab,
    setActiveEntTab,

    contextLoading,
    loadingPhase,
    hasLiveData,
    cachedAt: cachedData?.timestamp || cachedData?.savedAt || null,

    displayData,
    processedEntertainment,
    visibleEntertainment,
    socialTrends,
    technologyStories,
    technologyMaxDisplay,
    aiInnovationStories,

    navSections: NAV_SECTIONS,
    showBackToTop,
    scrollToTop,
    handleRefresh,
  };
}

export const __techSocialPageViewModelInternalsForTest = {
  BUZZ_PAGE_CACHE_KEY,
  BUZZ_REQUIRED_SECTIONS,
  ENTERTAINMENT_KEYWORDS,
  REGION_KEYWORDS,
  NAV_SECTIONS,
  asArray,
  asRecord,
  getStoryText,
  getPublishedAtMs,
  filterOldNews,
  sortNewestFirst,
  uniqueByStory,
  hasBuzzLiveData,
  normalizeBuzzCachePayload,
  safeReadBuzzCache,
  safeWriteBuzzCache,
  classifyEntertainmentRegion,
  projectEntertainmentStories,
  categorizeSocialRegion,
  distributeSocialTrends,
  projectTechnologyStories,
  projectAiInnovationStories,
  getFreshnessLimitHours,
  getTechnologyMaxDisplay,
};
