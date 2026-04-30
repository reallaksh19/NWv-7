# Appendix A: Benchmark 1 (BM1) - News Filtering, Ranking & Deduplication

## Objective
Validate the insight page's ability to filter, rank, deduplicate, and contextualize news stories across 300-500 diverse feeds over a 7-day rolling window.

## Test Dataset Specification

### Input: 350 News Feeds (Quantified)
- **Distribution by Source**: 
  - 50 feeds from NDTV (politics, business, sports, tech, entertainment)
  - 50 feeds from The Hindu (national, international, business)
  - 50 feeds from BBC (world, business, tech, entertainment)
  - 50 feeds from HackerNews (tech, startup, security)
  - 50 feeds from ArXiv (science, AI, physics, biology)
  - 50 feeds from ESPN (sports, cricket, football, tennis)
  - 50 feeds from variety sources (local news, blogs, niche sites)
  
- **Category Distribution**:
  - 70 feeds: Politics & Government
  - 60 feeds: Business & Finance
  - 50 feeds: Technology & Science
  - 40 feeds: Sports & Entertainment
  - 50 feeds: Local & Regional
  - 40 feeds: Health & Science
  - 40 feeds: International News

- **Date Range**: Past 7 days with realistic arrival patterns
  - 40% published 1-2 days ago
  - 35% published 2-4 days ago
  - 20% published 4-7 days ago
  - 5% published today

### Stories in Test Dataset: ~2,100 stories (6 stories/feed avg)
- 40% duplicate/near-duplicate (same story from multiple sources)
- 30% related but distinct (same event, different angles)
- 20% standalone stories
- 10% low-quality/spam content

## Expected Output: Insight Page

### Structure
**10 Top Stories** (ranked by relevance & coverage)
- **Story 1-10**: Each with up to 7 insights

### Quantitative Specification - Example Ideal Output

#### Story 1: "AI Breakthrough in Medical Imaging"
```
Story Details:
- Primary Source: Nature Journal (highest authority)
- Publication Date: 2026-04-27 14:30 UTC
- Category: Technology & Science
- Sentiment: Positive
- Coverage Score: 42 mentions across sources
- Deduplication Status: 42 variants consolidated → 1 story

Insights (7 maximum):
1. [Technical Deep-Dive] ArXiv paper link, methodology summary (2-3 sentences)
2. [Business Impact] 5 companies mentioned as stakeholders (research leaders, potential applicants)
3. [Timeline] Previous similar breakthroughs (2022 image recognition, 2023 radiography AI)
4. [Geographic Spread] 12 countries reporting on this story
5. [Expert Commentary] 3 quotes from 2+ different experts/researchers
6. [Related Stories] 5 connected stories from past 7 days (regulatory changes, market moves)
7. [Fact-Check Status] Cross-verified, no contradictions detected

Confidence: 98% (high coverage, authoritative sources, no contradictions)
```

#### Story 2: "Market Selloff in Tech Stocks"
```
Story Details:
- Primary Source: Financial Times
- Publication Date: 2026-04-26 09:15 UTC
- Category: Business & Finance
- Sentiment: Negative
- Coverage Score: 127 mentions (HIGH - major event)
- Deduplication Status: 127 variants consolidated → 1 story

Insights (7):
1. [Quantitative Impact] -3.2% NASDAQ, -2.8% S&P 500 (with time-series sparkline)
2. [Affected Sectors] Top 5: Cloud (-4.1%), AI (-3.9%), Semi (-3.5%), SaaS (-2.8%), Fintech (-2.2%)
3. [Root Cause Analysis] 3 competing theories: Fed policy, earnings misses, geopolitical tension
4. [Peer Comparison] Similar selloffs in 2022 (Feb, Sep), 2024 (Mar, Aug) - compare magnitudes
5. [Recovery Signals] VIX down 2%, Put/Call ratio normalizing (green flags)
6. [Expert Sentiment] 8 analyst quotes: 60% bullish long-term, 40% cautious
7. [Related Context] Connected to 12 earnings reports, 3 Fed announcements in past week

Confidence: 95% (high authority sources, real-time market data)
```

#### Stories 3-10
Follow similar structure with 7 insights each, maintaining unique combinations of:
- Commentary type (Technical, Business, Social, Regulatory, Comparative, Expert, Contextual)
- Different dates and sources to ensure temporal and source diversity
- Varying confidence levels (92-99%)

## Testing Criteria (Pass/Fail Thresholds)

| Criterion | Expected | Tolerance | Pass Test |
|-----------|----------|-----------|-----------|
| **Total Stories Listed** | 10 | ±0 | Exactly 10 |
| **Insights per Story** | 5-7 (avg 6.5) | ±0 | 5-7 per story, min 50 total |
| **Deduplication Accuracy** | 42 variants → 1 story (98%+) | ±1% | Zero false duplicates, <2% missed duplicates |
| **Ranking Quality** | Top 3 by coverage score, relevance | Subjective | Manual verification: stories ordered by importance |
| **Date Filtering** | All stories ≤7 days old | ±0 | No stories >7 days old |
| **Source Diversity** | Top 10 stories from 8+ different sources | ±1 source | Prevents single-source bias |
| **Insight Coverage** | Each insight type appears in 50+ insights | ±5% | All 7 insight types represented |
| **Response Time** | Load & render <500ms | ±100ms | Page usable in <2 seconds |
| **Fact Consistency** | No contradictions in insights | ±0 | Manual spot-check 30 random insights |

## Tunable Parameters & Optimization

### Parameter 1: Similarity Threshold
**Current**: Cosine similarity > 0.85 for deduplication
- **If too low** (<0.75): False positives, many duplicate entries shown
- **If too high** (>0.95): Related stories separated unnecessarily
- **Recommendation**: Keep at 0.85, monitor false positive rate weekly
- **Tuning Impact**: ±10% on deduplication accuracy

### Parameter 2: Ranking Algorithm
**Current**: `score = (coverage_weight × 0.5) + (recency_weight × 0.3) + (authority_weight × 0.2)`
- Weights can be adjusted based on user preferences (e.g., latest vs. most-covered)
- **Tuning**: Use A/B testing to validate ranking order
- **Recommendation**: Keep authority high for news, allow user override for "trending" view
- **Tuning Impact**: ±15% on story ranking order

### Parameter 3: Date Window
**Current**: 7 days rolling window
- **Alternative**: 3-day (breaking news), 14-day (weekly brief), 30-day (monthly digest)
- **Recommendation**: Keep 7 days as default, add user-selectable window
- **Tuning Impact**: Changes dataset size, filters freshness

### Parameter 4: Minimum Coverage Threshold
**Current**: Min 3 sources for inclusion, min 5 for "Trending"
- **If too low** (<2): Includes fringe/low-authority stories
- **If too high** (>8): Excludes emerging stories before widespread coverage
- **Recommendation**: Keep at 3, use editorial review for borderline cases
- **Tuning Impact**: ±20% dataset size

## Bottlenecks & Expected Issues

### Bottleneck 1: Deduplication Speed
**Problem**: With 2,100 stories, pairwise similarity comparison = O(n²) = 4.4M comparisons
- **Current Solution**: Use TF-IDF + cosine similarity (vectorized with NumPy)
- **Expected Runtime**: 3-5 seconds on standard hardware
- **Optimization**: 
  - Use clustering (group by keywords first, then compare within clusters)
  - Implement early termination (stop if similarity > 0.95)
  - Cache similarity matrix for incremental updates
- **Fix**: Move to GPU acceleration if >5,000 stories needed

### Bottleneck 2: Insight Generation
**Problem**: Generating 70 insights (10 stories × 7 each) with API calls
- **Current Solution**: Batch API calls, cache results
- **Expected Runtime**: 2-10 seconds (depends on API latency)
- **Optimization**:
  - Pre-compute common insights (e.g., geographic spread) offline
  - Use local NLP for sentiment/entity extraction before API calls
  - Implement fallback: show 4-5 insights if API times out
- **Fix**: Implement request queuing & rate-limiting to prevent API overload

### Bottleneck 3: Memory Usage
**Problem**: Storing 2,100 stories + metadata in browser memory
- **Current Solution**: Pagination (show 10 stories, lazy-load others)
- **Expected Memory**: ~20-30 MB for full dataset
- **Optimization**:
  - Compress story objects (remove raw HTML, keep summary only)
  - Implement IndexedDB for client-side storage
  - Stream insights on demand instead of preloading all 7
- **Fix**: Use service worker to cache dataset between sessions

## Validation Checklist (Zero-Diff Achievement)

- [ ] Run benchmark with test dataset of 350 feeds
- [ ] Verify exactly 10 stories appear on insights page
- [ ] Count insights per story: all 5-7 range ✓
- [ ] Check deduplication: 42 variants → 1 story (example case) ✓
- [ ] Verify no stories >7 days old ✓
- [ ] Confirm top story matches highest coverage (42 mentions) ✓
- [ ] Verify 8+ sources represented in top 10 ✓
- [ ] Test date filtering with edge cases (7 days 00:00, 7 days 23:59) ✓
- [ ] Load time <500ms after optimization ✓
- [ ] Spot-check 5 stories for insight accuracy ✓

## Summary: Zero-Diff Targets

| Metric | Target | Tolerance |
|--------|--------|-----------|
| Total Stories | 10 | ±0 |
| Total Insights | 50-70 | ±0 |
| Deduplication Rate | 42→1 (98%+) | ±1% |
| Top 3 by Coverage | Highest coverage | Manual review |
| No Stories >7 Days | 0 old stories | ±0 |
| Source Diversity | 8+ sources | ±1 |
| Response Time | <500ms | ±100ms |
