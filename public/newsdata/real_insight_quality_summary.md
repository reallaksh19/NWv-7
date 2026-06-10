# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.6`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.8`
- Base report share: `0.2`
- Multi-angle parents: `6`
- Weak parents: `0`
- Story count: `614`
- Source groups: `10`
- Content hash: `cca1fe7658f1ae87`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Wadhwa Group leases 33K sq ft office space in Mumbai for Rs 44 cr rental in 9-yr period | 2 | regional_followup, fact_update | NO | 0.7514800531183317 |
| 2 | Tata Group units plan bond sales after year-long gap, bankers say | 2 | base_report, market_reaction | NO | 0.6912467197849983 |
| 3 | CMRL pay-off case: ED calls T Veena for questioning on June 12 | 2 | investigative_detail, official_response | NO | 0.6564967197849982 |
| 4 | NASA announces Artemis III crew; taps U.S. astronauts, Italian for mission with SpaceX, Blue Origin mooncraft | 2 | base_report, investigative_detail | NO | 0.5815232802150019 |
| 5 | SAIL, NMDC explore Russian coking coal assets, nickel supplies | 2 | investigative_detail, regional_followup | NO | 0.5723433333333332 |
| 6 | Manslaughter charges laid over deadly Hong Kong fire | 2 | investigative_detail, fact_update | NO | 0.5612732802150018 |
| 7 | $1.75 trillion valuation, among 5 risks about world’s biggest stock market debut | 2 | market_reaction | NO | 0.7592300531183317 |
| 8 | 6.1 magnitude earthquake hits offshore Cuba; tremors felt in Florida | 2 | fact_update | NO | 0.6874967197849983 |
| 9 | How one of India's most successful female politicians is losing her party | 2 | base_report | NO | 0.6832467197849983 |
| 10 | Congress delegation meets ECI over rejection of Meenakshi Natarajan’s nomination | 2 | official_response | NO | 0.6814967197849984 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.6`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.8`
- Base report share: `0.2`
- Multi-angle parents: `6`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.6`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.6` / `>= 1.4`
- Average evolution role count: `1.8` / `>= 1.6`
- Base report share: `0.2` / `<= 0.55`
- Multi-angle parent count: `6` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
