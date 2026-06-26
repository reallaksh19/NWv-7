# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.3`
- Average temporal tiers: `1.8`
- Average evolution roles: `1.5`
- Base report share: `0.14285714285714285`
- Multi-angle parents: `3`
- Weak parents: `7`
- Story count: `641`
- Source groups: `9`
- Content hash: `bb6845e4e4138d01`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | What's a 'doublet' earthquake? Science behind Venezuela’s strongest quake in over a century | 2 | official_response, base_report | NO | 0.7254967197849984 |
| 2 | Muharram processions held across Kashmir; CM Omar, L-G Sinha join mourners | 2 | base_report, official_response | NO | 0.60551 |
| 3 | Small aircraft crashes into Beijing's tallest skyscraper | 2 | base_report, official_response | NO | 0.5724232802150018 |
| 4 | Venezuela health minister says around 235 people dead, 4,300 injured in catastrophic earthquakes | 3 | fact_update | YES | 0.6479573212916498 |
| 5 | UN agency pauses evacuation of ships through Strait of Hormuz after attack on vessel | 2 | official_response | YES | 0.6792467197849983 |
| 6 | Death toll in Kolkata warehouse collapse rises to 15 | 3 | fact_update | YES | 0.6535487346782661 |
| 7 | Exclusive / Amazon CEO Andy Jassy Announces $48 Billion India Investment Plan, Bets Big on AWS & AI - News18 | 2 | fact_update | YES | 0.6567800531183315 |
| 8 | India says 'very close' to trade deal with US - Reuters | 2 | official_response | YES | 0.5678433333333333 |
| 9 | U.S. Supreme Court’s ruling to end protections for Haitian, Syrian immigrants could have broader impact | 2 | official_response | YES | 0.5282732802150019 |
| 10 | Silver Consumer Electricals concludes Rs 150 cr pre-IPO secondary share sale | 1 | market_reaction | YES | 0.7226911614783158 |

## Warnings

- Real snapshot still produces low Insight grade.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `18`
- Parents: `10`
- Average angles: `1.3`
- Average temporal tiers: `1.8`
- Average evolution roles: `1.5`
- Base report share: `0.143`
- Multi-angle parents: `3`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Average visible angle count** — actual `1.3`, required `>= 1.4`. Fix: Angle-diverse child selection is not strong enough on real data.
- **Average evolution role count** — actual `1.5`, required `>= 1.6`. Fix: C+E output should include distinct event evolution roles.
- **Weak parent ratio** — actual `0.7`, required `<= 0.5`. Fix: Too many weak trees remain. Repair or demote weak trees after diversity repair.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Average temporal tier count: `1.8` / `>= 1.8`
- Base report share: `0.143` / `<= 0.55`
- Multi-angle parent count: `3` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
