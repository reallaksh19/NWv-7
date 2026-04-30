# Appendix B: Benchmark 2 (BM2) - Location-Aware & Date-Aware News Aggregation

## Objective
Validate the app's ability to filter, rank, and contextualize news stories with geographic awareness, temporal patterns (7-day planner), category coverage, and local context deduplication.

## Test Dataset Specification

### Geographic Distribution: Chennai Metropolitan Area
```
Cities/Areas in Dataset:
- Chennai (Main city) - 40 stories
- T. Nagar (Shopping district) - 25 stories  
- Adayar (Residential area) - 20 stories
- Mylapore (Cultural hub) - 18 stories
- Besant Nagar (Beachside) - 15 stories
- Nungambakkam (Business district) - 22 stories
- Velachery (IT corridor) - 28 stories
- Tambaram (Suburban) - 18 stories
- Kanchipuram (Nearby city) - 12 stories
- Tirupati (Regional hub) - 8 stories

Total Geographic Variants: 206 location-tagged stories
```

### Content Categories in Dataset: 250 total stories

| Category | Count | Key Characteristics |
|----------|-------|-------------------|
| **Local News** | 60 | Traffic, municipal, events, community |
| **Business & Local Markets** | 35 | Shop closures, local traders, commercial news |
| **Traffic & Commute** | 28 | Road closures, transit delays, construction |
| **Events & Entertainment** | 32 | Movies, concerts, festivals, cultural events |
| **Offers & Deals** | 35 | Local promotions, restaurant deals, discounts |
| **Alerts & Emergencies** | 20 | Weather alerts, safety warnings, disruptions |
| **Food & Dining** | 22 | New restaurants, reviews, food events |
| **Sports (Local)** | 18 | Local tournaments, stadiums, teams |

### Temporal Distribution: 7-Day Planner Window

```
Day 1 (Today): 25 stories
Day 2 (Tomorrow): 22 stories (with predictions)
Day 3: 20 stories
Day 4: 18 stories
Day 5: 20 stories
Day 6: 22 stories
Day 7: 18 stories (oldest entries in window)

Total: 145 stories with future dates
Additional: 105 historical stories (>7 days old, for context)
Grand Total: 250 stories
```

### Duplicate Variants by Category

| Category | Unique Stories | Duplicate Variants | Dedup Target |
|----------|----------------|--------------------|--------------|
| Local News | 15 | 45 (15×3) | 15 consolidated |
| Traffic Alerts | 8 | 24 (8×3) | 8 consolidated |
| Offers & Deals | 12 | 36 (12×3) | 12 consolidated |
| Events | 10 | 20 (10×2) | 10 consolidated |
| Food & Dining | 7 | 14 (7×2) | 7 consolidated |
| Other | 48 | 96 (48×2) | 48 consolidated |
| **TOTAL** | **100 unique** | **235 duplicates** | **100 final** |

## Expected Output Structure

### 7-Day Planner View (Location & Date-Aware)

#### Day 1 (Today - April 28, 2026)
```
📍 LOCATION-AWARE AGGREGATION
├─ Chennai (Citywide): 8 stories
│  ├─ Traffic Alert: "Pondy Bazaar road closure 3-7 PM" (shared 4 sources)
│  ├─ Event: "Summer Festival opening today at Marina Beach"
│  ├─ Food: "New rooftop cafe opens in T. Nagar"
│  ├─ Offer: "All-day 40% off at Nangudi textiles"
│  ├─ Local News: "Civic body approves 3 new bus routes"
│  ├─ Weather Alert: "Heat index 42°C, stay hydrated"
│  ├─ Sports: "Cricket tournament begins at Chepauk"
│  └─ Community: "Cleanup drive at Kothawalchavadi lake"
│
├─ T. Nagar (Shopping District): 4 stories
│  ├─ Offer: "Saravana Stores grand sale 50% off"
│  ├─ Traffic: "Reduced lanes near Nangudi due to repairs"
│  ├─ Food: "New ice cream parlor opening"
│  └─ Event: "Street market on weekends"
│
├─ Adayar (Residential): 3 stories
│  ├─ Alert: "Water supply disruption 10-2 PM"
│  ├─ Event: "Yoga class at community center"
│  └─ Local: "New pharmacy near Metro station"
│
└─ Other Areas: 2 stories (aggregated)

**Deduplication Applied**: 
- Traffic alert consolidated from 4 sources → shown once
- Offer aggregated across 2 variants → unified entry
- Citywide events deduplicated (20 variants → 2 unique stories)

**Confidence Metrics**:
- High confidence (3+ sources): 8 stories (Green ✓)
- Medium confidence (2 sources): 3 stories (Yellow ⚠)
- Low confidence (1 source): 2 stories (Gray ⓘ)
```

#### Day 2 (Tomorrow - April 29, 2026)
```
⏰ PREDICTED/SCHEDULED EVENTS
├─ Chennai Citywide: 6 predicted stories
│  ├─ Event: "Summer Festival Day 2 (Booked: 85% capacity)"
│  ├─ Offer: "Flash sale at Phoenix Marketcity (2 PM start)"
│  ├─ Traffic: "Expected delays near Anna University exam center"
│  ├─ Food: "Food truck festival at beach (5 PM-10 PM)"
│  ├─ Sports: "Cricket match semifinals (6 PM, check tickets)"
│  └─ Weather: "Clear skies, high 38°C"
│
├─ T. Nagar: 2 stories
│  ├─ Offer: "Nangudi sale continues (Day 2)"
│  └─ Event: "Street market hours 10 AM-8 PM"
│
└─ Velachery: 1 story
   └─ Event: "Tech meetup at startup hub (7 PM)"

**Prediction Confidence**: 75% (based on historical patterns)
```

#### Days 3-7: Cascading structure with decreasing confidence

```
Day 3: 5 high-confidence stories, 3 medium-confidence predictions
Day 4: 3 high-confidence, 5 medium-confidence predictions  
Day 5: 2 high-confidence, 6 low-confidence predictions
Day 6-7: Mostly low-confidence (archive/historical context)
```

## Testing Criteria (Pass/Fail Thresholds)

| Criterion | Expected | Tolerance | Pass Test |
|-----------|----------|-----------|-----------|
| **Total Stories (7-day window)** | 145 | ±5 | 140-150 stories shown |
| **Unique Stories After Dedup** | 100 | ±2 | 98-102 stories (235 duplicates consolidated) |
| **Location Grouping** | 10 unique areas | ±0 | All 10 geographic areas present |
| **Location Accuracy** | Stories in correct location cluster | ±1% | Spot-check 20 stories for geo-tagging |
| **Date Filtering** | Stories in correct day bucket | ±0 | No stories in wrong date section |
| **Category Coverage** | All 8 categories represented** | ±0 | Each category has 3+ stories OR 0 (intentional) |
| **Deduplication by Location** | Same story different location counted separately | ±0 | Example: "Road closure" from Chennai Police & Traffic = 1 story, not 2 |
| **Temporal Ordering** | Day 1 → Day 7 chronological | ±0 | Days ordered correctly |
| **Confidence Metrics** | High (3+ sources), Med (2), Low (1) | ±1% | Accuracy >98% |
| **Prediction Accuracy** | Day 2-7 predictions match 75%+ of actual future news | Check post-event | Validate after 7 days |
| **Response Time** | Load & render 150 stories <1000ms | ±200ms | Page interactive in <2 seconds |
| **Cross-Location Dedup** | "Road closure in Chennai" same as "Road closure near T. Nagar" | ±0 | Geo-aware dedup prevents duplication |

## Tunable Parameters & Optimization

### Parameter 1: Geographic Proximity Radius
**Current**: Exact location match (T. Nagar ≠ Nangudi)
- **If Strict (0 km)**: Each micro-location is separate (current)
- **If Relaxed (2 km radius)**: T. Nagar + Nangudi merged (lose granularity)
- **If Very Relaxed (10 km)**: All merged under "North Chennai" (lose detail)
- **Recommendation**: Strict by default, allow user toggle for "Area View"
- **Tuning Impact**: Reduces story count by 20-40% if merged

### Parameter 2: Temporal Window
**Current**: 7-day planner (rolling window)
- **Alternative Windows**:
  - 3-day (urgent alerts only)
  - 14-day (weekly digest)
  - 30-day (monthly archive)
- **Recommendation**: Keep 7-day as default, add tab for "Extended Forecast"
- **Tuning Impact**: Doubles/halves dataset size based on selection

### Parameter 3: Similarity Threshold for Cross-Location Stories
**Current**: Cosine similarity >0.80 for same-story different-location
- **Example**: "Road closure Pondy Bazaar" (from 4 sources) = 1 consolidated story
- **If too low** (<0.75): Different road closures incorrectly merged
- **If too high** (>0.90): Same closure listed 4 times (one per source)
- **Recommendation**: Keep at 0.80 for general news, 0.90 for traffic alerts
- **Tuning Impact**: ±15% deduplication rate

### Parameter 4: Confidence Threshold for Display
**Current**: Show all stories with confidence display (Green/Yellow/Gray)
- **If Strict** (3+ sources only): Reduce clutter, miss breaking news
- **If Relaxed** (1+ sources): Include everything, increase noise
- **Recommendation**: Show all with confidence labels, let user filter
- **Tuning Impact**: ±40% displayed story count

### Parameter 5: Category Weighting in "Important" Rank
**Current**: Traffic, Alerts, Events = high priority; Food, Offers = low priority
```
Weights: Traffic (2.0) > Alerts (1.8) > Events (1.5) > Local News (1.0) > Offers (0.5) > Food (0.3)
```
- **Recommendation**: Keep weighted, allow user customization per preference
- **Tuning Impact**: Changes story sort order by 30-50%

## Bottlenecks & Expected Issues

### Bottleneck 1: Geographic Deduplication Complexity
**Problem**: Same story appears for 3 locations (Chennai, T. Nagar, Adayar) with slight variations
- **Example**:
  - Source 1: "Road closure in Chennai CBD area"
  - Source 2: "T. Nagar road closed due to repairs"
  - Source 3: "Pondy Bazaar affected by traffic disruption"
  - All 3 might refer to the SAME closure but with different location specificity
- **Current Solution**: 
  - Extract entity locations from text (NER)
  - Compare location hierarchies (city > district > street)
  - Consolidate if >80% text similarity AND overlapping geo-coordinates
- **Expected Runtime**: 500-800ms for 145 stories with geo-tagging
- **Optimization**:
  - Pre-filter by geographic proximity (skip stories >10km apart)
  - Use fuzzy location matching (T. Nagar ≈ TNagar = T.Nagar)
  - Cache location coordinates (Chennai = 13.0827°N, 80.2707°E)
- **Fix**: Use PostGIS or geo-hashing library for fast spatial queries

### Bottleneck 2: Temporal Prediction Accuracy
**Problem**: Predicting Day 2-7 stories from 1-day past data
- **Current Solution**: 
  - Historical pattern matching (what happened last Tuesday?)
  - Event calendar lookups (scheduled events, festivals)
  - Weather pattern analysis
- **Expected Accuracy**: 60-75% for Day 2, decreasing to 30% for Day 7
- **Optimization**:
  - Use ML model trained on 6-month history
  - Incorporate official event calendars (festival dates, sports schedules)
  - Weight recent trends more heavily
- **Fix**: Train time-series model (ARIMA/Prophet) on historical data

### Bottleneck 3: Memory with Cross-Location Variants
**Problem**: Storing 250 stories in memory, each potentially duplicated across locations
- **Current Solution**: Deduplicate before storage (100 unique stories stored, not 235)
- **Expected Memory**: ~15-20 MB for 145 unique stories
- **Optimization**:
  - Use object pooling for story cards
  - Implement virtualization (render only visible items)
  - Compress location arrays (store refs instead of full objects)
- **Fix**: Move to IndexedDB + service worker for persistent cache

### Bottleneck 4: Real-Time Update Complexity
**Problem**: As new stories arrive, must:
  1. Check for duplicates with existing stories
  2. Reassign to correct location/date
  3. Recompute confidence metrics
  4. Re-rank stories
- **Current Solution**: Batch updates (update every 5 minutes)
- **Expected Processing Time**: 200-400ms per batch (5-10 new stories)
- **Optimization**:
  - Use delta updates (only process new stories, not full recompute)
  - Precompute top-K stories separately
  - Use memoization for unchanged sections
- **Fix**: Implement event-driven architecture (WebSocket updates) for real-time

## Validation Checklist (Zero-Diff Achievement)

- [ ] Load 250-story dataset with 10 geographic areas
- [ ] Verify 145 stories in 7-day window, 105 older for context
- [ ] Check deduplication: 235 variants → 100 unique stories ✓
- [ ] Verify location grouping: All 10 areas displayed with correct story counts
- [ ] Validate date buckets: Stories in correct day (Day 1-7)
- [ ] Spot-check 10 stories: Confidence labels match source count (3 sources = Green)
- [ ] Verify cross-location dedup: Same road closure from 4 sources = 1 story, not 4
- [ ] Test edge case: Story exactly at 7-day boundary (7 days 00:00 vs 00:01)
- [ ] Verify category coverage: All 8 categories present (or intentionally filtered)
- [ ] Load time <1000ms with 150 stories rendered
- [ ] Check prediction accuracy post-event (after 7 days)
- [ ] Test user toggle: "Merged Areas" view (T. Nagar + Nangudi) ✓

## Summary of Zero-Diff Strategy

**Key Metrics for Validation:**
1. **Deduplication**: 235 → 100 (57% reduction, zero false positives)
2. **Geographic Accuracy**: 10 areas, correct story assignments
3. **Temporal Precision**: 145 stories in window, 105 archived (zero misplacement)
4. **Confidence Scoring**: 98%+ accuracy match (source count = label)
5. **Load Time**: <1000ms for full 7-day view

**Tunable Parameters Summary Table:**

| Parameter | Default | Min | Max | Impact |
|-----------|---------|-----|-----|--------|
| Geo Proximity Radius | 0 km | 0 | 10 | Story count (-40% to +0%) |
| Similarity Threshold | 0.80 | 0.70 | 0.95 | Dedup rate (±20%) |
| Temporal Window | 7 days | 3 | 30 | Dataset size (±60%) |
| Confidence Display | All | High only | Low only | Clarity (±50% stories) |
| Category Weight (Traffic) | 2.0 | 1.0 | 3.0 | Sort order (±30%) |

## Testing Implementation Script

To validate BM2 locally, create test harness:

```javascript
// test-benchmark-bm2.js
const testDataset = {
  totalStories: 250,
  locationDistribution: {
    Chennai: 40,
    'T. Nagar': 25,
    Adayar: 20,
    Mylapore: 18,
    'Besant Nagar': 15,
    Nungambakkam: 22,
    Velachery: 28,
    Tambaram: 18,
    Kanchipuram: 12,
    Tirupati: 8
  },
  sevenDayWindow: 145,
  uniqueAfterDedup: 100,
  duplicateVariants: 235
};

// Expected results
const expectedResults = {
  storiesIn7DayWindow: { min: 140, max: 150 },
  uniqueStories: { min: 98, max: 102 },
  deduplicationRate: 0.57, // 235 → 100
  loadTimeMs: { max: 1000, tolerance: 200 },
  confidenceAccuracy: { min: 0.98 },
  allLocationsPresent: 10,
  allCategoriesCovered: 8
};
```
