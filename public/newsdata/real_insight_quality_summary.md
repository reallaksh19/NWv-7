# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.7`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.8`
- Base report share: `0.2608695652173913`
- Multi-angle parents: `7`
- Weak parents: `3`
- Story count: `610`
- Source groups: `9`
- Content hash: `b0d21427409b2189`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | What's a 'doublet' earthquake? Science behind Venezuela’s strongest quake in over a century | 2 | official_response, base_report | NO | 0.6814967197849984 |
| 2 | Muharram processions held across Kashmir; CM Omar, L-G Sinha join mourners | 2 | base_report, official_response | NO | 0.60551 |
| 3 | US conducts strikes on Iran after attack on cargo ship | 3 | base_report, official_response | NO | 0.5622939846283528 |
| 4 | Small aircraft crashes into Beijing's tallest skyscraper | 2 | base_report, official_response | NO | 0.5964100000000001 |
| 5 | Trump adviser-turned-critic John Bolton pleads guilty to mishandling classified documents | 2 | regional_followup, official_response | NO | 0.5952599999999999 |
| 6 | Israel and Lebanon sign framework agreement after US-brokered talks | 2 | base_report, official_response | NO | 0.5852600000000001 |
| 7 | India says it discussed pathways to interim trade deal with US - Reuters | 2 | base_report, official_response | NO | 0.5623433333333332 |
| 8 | Venezuela health minister says around 235 people dead, 4,300 injured in catastrophic earthquakes | 3 | fact_update | YES | 0.6479573212916498 |
| 9 | UN agency pauses evacuation of ships through Strait of Hormuz after attack on vessel | 2 | official_response | YES | 0.6792467197849983 |
| 10 | Death toll in Kolkata warehouse collapse rises to 15 | 3 | fact_update | YES | 0.6535487346782661 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.7`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.8`
- Base report share: `0.261`
- Multi-angle parents: `7`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.6`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.7` / `>= 1.4`
- Average evolution role count: `1.8` / `>= 1.6`
- Base report share: `0.261` / `<= 0.55`
- Multi-angle parent count: `7` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0.3` / `<= 0.5`
