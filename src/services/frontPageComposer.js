import { rankByTemporalScore } from './temporalScorer.js';

/**
 * Composes a balanced front page with diversity constraints
 */

export function composeBalancedFeed(articles, limit = 20, maxTopicPercent = 40, maxGeoPercent = 30) {
    const selected = [];
    const topicCounts = new Map();
    const geoCounts = new Map();

    // Sort by impact score (highest first)
    // We assume impactScore is present, otherwise we default to 0.
    // If scores are equal or missing, the original order is preserved roughly by the sort stability or nature of data.
    // Quality gate: filter out low-relevance articles before sorting.
    // Minimum score of 2.5 keeps breaking news while filtering celebrity filler.
    // Safety: if fewer than 5 qualify, use top-scored from full list to avoid empty feed.
    const MIN_IMPACT = 1.5;
    const qualified  = articles.filter(a => (a.impactScore || 0) >= MIN_IMPACT);
    const pool       = qualified.length >= 5
        ? qualified
        : [...articles].sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0)).slice(0, limit * 2);

    // Rank by temporal decay scoring (freshness + impact)
    const sorted = rankByTemporalScore(pool);

    const sectionBuckets = new Map();
    for (const article of sorted) {
        const section = article.section || 'general';
        if (!sectionBuckets.has(section)) sectionBuckets.set(section, []);
        sectionBuckets.get(section).push(article);
    }

    const sectionOrder = Array.from(sectionBuckets.keys());
    let sectionCursor = 0;

    while (selected.length < limit && sectionOrder.length > 0) {
        const section = sectionOrder[sectionCursor % sectionOrder.length];
        const bucket = sectionBuckets.get(section) || [];
        const article = bucket.shift();
        if (!article) {
            sectionBuckets.delete(section);
            sectionOrder.splice(sectionCursor % sectionOrder.length, 1);
            continue;
        }
        if (selected.length >= limit) break;

        // Extract topic and geography
        const topic = article.section || 'general';
        const geo = extractGeography(article.title, article.description);

        const topicCount = topicCounts.get(topic) || 0;
        const geoCount = geoCounts.get(geo) || 0;

        // Diversity constraints
        const maxPerTopic = Math.floor(limit * (maxTopicPercent / 100));
        const maxPerGeo = Math.floor(limit * (maxGeoPercent / 100));

        // Skip if exceeds constraints
        // Note: We check strictly '>=', so if max is 8, and we have 8, we skip the 9th.
        if (topicCount >= maxPerTopic) {
            // console.log(`[Composer] Skipping "${article.title}" - topic limit reached`);
            sectionCursor += 1;
            continue;
        }

        if (geoCount >= maxPerGeo) {
            // console.log(`[Composer] Skipping "${article.title}" - geo limit reached`);
            sectionCursor += 1;
            continue;
        }

        // Add to selection
        selected.push(article);
        topicCounts.set(topic, topicCount + 1);
        geoCounts.set(geo, geoCount + 1);
        sectionCursor += 1;
    }

    console.log('[Composer] Final composition:', {
        total: selected.length,
        byTopic: Object.fromEntries(topicCounts),
        byGeo: Object.fromEntries(geoCounts)
    });

    return selected;
}

/**
 * Extract primary geography from article
 */
export function extractGeography(title, description) {
    const text = `${title || ''} ${description || ''}`.toLowerCase();

    // Priority order: local > regional > national > global
    if (/chennai|madras/i.test(text)) return 'chennai';
    if (/trichy|tiruchirappalli/i.test(text)) return 'trichy';
    if (/tamil nadu|tn /i.test(text)) return 'tamil-nadu';
    if (/india|delhi|mumbai|bangalore/i.test(text)) return 'india';

    return 'global';
}
