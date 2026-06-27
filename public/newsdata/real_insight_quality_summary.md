# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.8`
- Average temporal tiers: `1.7`
- Average evolution roles: `1.8`
- Base report share: `0.2727272727272727`
- Multi-angle parents: `7`
- Weak parents: `3`
- Story count: `560`
- Source groups: `10`
- Content hash: `091b439c72d1a389`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | US strikes Iran in response to ship attack that Trump called a ceasefire violation | 3 | base_report, official_response, market_reaction | NO | 0.6032939846283528 |
| 2 | Muharram processions held across Kashmir; CM Omar, L-G Sinha join mourners | 2 | base_report, official_response | NO | 0.6814967197849984 |
| 3 | What's a 'doublet' earthquake? Science behind Venezuela’s strongest quake in over a century | 2 | official_response, base_report | NO | 0.6814967197849984 |
| 4 | Small aircraft crashes into Beijing's tallest skyscraper | 2 | base_report, official_response | NO | 0.6723967197849983 |
| 5 | Israel and Lebanon sign framework agreement after US-brokered talks | 2 | base_report, official_response | NO | 0.6052599999999999 |
| 6 | Trump adviser-turned-critic John Bolton pleads guilty to mishandling classified documents | 2 | regional_followup, official_response | NO | 0.5952599999999999 |
| 7 | India says it discussed pathways to interim trade deal with US - Reuters | 2 | base_report, official_response | NO | 0.5623433333333332 |
| 8 | Venezuela health minister says around 235 people dead, 4,300 injured in catastrophic earthquakes | 3 | fact_update | YES | 0.6679143876382674 |
| 9 | UN agency pauses evacuation of ships through Strait of Hormuz after attack on vessel | 2 | official_response | YES | 0.6792467197849983 |
| 10 | Death toll in Kolkata warehouse collapse rises to 15 | 2 | fact_update | YES | 0.6604967197849982 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.8`
- Average temporal tiers: `1.7`
- Average evolution roles: `1.8`
- Base report share: `0.273`
- Multi-angle parents: `7`
- Top parent angles: `3`
- Top parent children: `3`

### Failed gates

- **Average temporal tier count** — actual `1.7`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.8` / `>= 1.4`
- Average evolution role count: `1.8` / `>= 1.6`
- Base report share: `0.273` / `<= 0.55`
- Multi-angle parent count: `7` / `>= 1`
- Top parent angle count: `3` / `>= 2`
- Top parent child depth: `3` / `>= 2`
- Weak parent ratio: `0.3` / `<= 0.5`
