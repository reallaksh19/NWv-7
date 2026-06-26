# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.2`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.3`
- Base report share: `0`
- Multi-angle parents: `2`
- Weak parents: `8`
- Story count: `593`
- Source groups: `9`
- Content hash: `7200eda3167de2b2`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | World leaders offers solidarity and aid as country reels from quakes | 2 | official_response, fact_update | NO | 0.6934967197849984 |
| 2 | Snap sued over minor’s rape after she connected with assaulter on Snapchat | 2 | official_response, investigative_detail | NO | 0.6325800531183317 |
| 3 | Venezuela health minister says around 235 people dead, 4,300 injured in catastrophic earthquakes | 3 | fact_update | YES | 0.6319606512950194 |
| 4 | Death toll in Kolkata warehouse collapse rises to 15 | 3 | fact_update | YES | 0.6015916683316486 |
| 5 | Amazon CEO meets PM Modi; announces plans to invest additional $13 billion in India on cloud, AI | 2 | fact_update | YES | 0.6034766666666667 |
| 6 | UN agency pauses evacuation of ships through Strait of Hormuz after attack on vessel | 2 | official_response | YES | 0.5792732802150018 |
| 7 | U.S. Supreme Court’s ruling to end protections for Haitian, Syrian immigrants could have broader impact | 2 | official_response | YES | 0.5282732802150019 |
| 8 | Power Grid of India board okays raising borrowing limit to Rs 2.2 lakh cr | 1 | fact_update | YES | 0.7226911614783158 |
| 9 | Goldman Sachs upgrades India's growth outlook after US-Iran peace deal | 1 | fact_update | YES | 0.7226911614783158 |
| 10 | HDFC Mutual Fund buys additional 10 lakh shares of Global Health for Rs 130 crore | 1 | fact_update | YES | 0.7226911614783158 |

## Warnings

- Real snapshot still produces low Insight grade.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `0`
- Parents: `10`
- Average angles: `1.2`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.3`
- Base report share: `0`
- Multi-angle parents: `2`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Average visible angle count** — actual `1.2`, required `>= 1.4`. Fix: Angle-diverse child selection is not strong enough on real data.
- **Average temporal tier count** — actual `1.6`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.
- **Average evolution role count** — actual `1.3`, required `>= 1.6`. Fix: C+E output should include distinct event evolution roles.
- **Weak parent ratio** — actual `0.8`, required `<= 0.5`. Fix: Too many weak trees remain. Repair or demote weak trees after diversity repair.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Base report share: `0` / `<= 0.55`
- Multi-angle parent count: `2` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
