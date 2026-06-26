# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.7`
- Average evolution roles: `1.5`
- Base report share: `0.14285714285714285`
- Multi-angle parents: `4`
- Weak parents: `6`
- Story count: `671`
- Source groups: `9`
- Content hash: `814cb3e0176b3c50`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | What's a 'doublet' earthquake? Science behind Venezuela’s strongest quake in over a century | 2 | official_response, base_report | NO | 0.7254967197849984 |
| 2 | World leaders offers solidarity and aid as country reels from quakes | 2 | official_response, fact_update | NO | 0.6934967197849984 |
| 3 | Small aircraft crashes into Beijing's tallest skyscraper | 2 | base_report, official_response | NO | 0.5724232802150018 |
| 4 | India says it discussed pathways to interim trade deal with US - Reuters | 2 | base_report, official_response | NO | 0.5623433333333332 |
| 5 | Venezuela health minister says around 235 people dead, 4,300 injured in catastrophic earthquakes | 3 | fact_update | YES | 0.6479573212916498 |
| 6 | UN agency pauses evacuation of ships through Strait of Hormuz after attack on vessel | 2 | official_response | YES | 0.6792467197849983 |
| 7 | Death toll in Kolkata warehouse collapse rises to 15 | 3 | fact_update | YES | 0.6535487346782661 |
| 8 | Exclusive / Amazon CEO Andy Jassy Announces $48 Billion India Investment Plan, Bets Big on AWS & AI - News18 | 2 | fact_update | YES | 0.6567800531183315 |
| 9 | U.S. Supreme Court’s ruling to end protections for Haitian, Syrian immigrants could have broader impact | 2 | official_response | YES | 0.5282732802150019 |
| 10 | Power Grid of India board okays raising borrowing limit to Rs 2.2 lakh cr | 1 | fact_update | YES | 0.7226911614783158 |

## Warnings

- Real snapshot still produces low Insight grade.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `18`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.7`
- Average evolution roles: `1.5`
- Base report share: `0.143`
- Multi-angle parents: `4`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Average temporal tier count** — actual `1.7`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.
- **Average evolution role count** — actual `1.5`, required `>= 1.6`. Fix: C+E output should include distinct event evolution roles.
- **Weak parent ratio** — actual `0.6`, required `<= 0.5`. Fix: Too many weak trees remain. Repair or demote weak trees after diversity repair.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.4` / `>= 1.4`
- Base report share: `0.143` / `<= 0.55`
- Multi-angle parent count: `4` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
