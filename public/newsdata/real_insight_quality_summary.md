# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.6`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.6`
- Base report share: `0.23529411764705882`
- Multi-angle parents: `6`
- Weak parents: `4`
- Story count: `730`
- Source groups: `10`
- Content hash: `e1125d3950cc318a`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | India’s largest private gold mine set to yield a tonne of gold a year | 2 | regional_followup, fact_update | NO | 0.712563386451665 |
| 2 | India slams Pakistan for 'unwarranted' remarks on J&K at UNSC’s Arria-formula meeting | 2 | official_response, base_report | NO | 0.6814967197849984 |
| 3 | StartupTN CEO Sivarajah Ramanathan resigns | 2 | base_report, investigative_detail | NO | 0.6756467197849984 |
| 4 | Pakistani man held French woman, children captive for 12 years; child's escape leads to rescue | 2 | investigative_detail, base_report | NO | 0.6741467197849984 |
| 5 | World leaders offers solidarity and aid as country reels from quakes | 2 | official_response, fact_update | NO | 0.62551 |
| 6 | UN nuclear chief says inspectors will visit Iran sites as part of war deal | 2 | base_report, official_response | NO | 0.6052599999999999 |
| 7 | Amazon CEO meets PM Modi; announces plans to invest additional $13 billion in India on cloud, AI | 2 | fact_update | YES | 0.6034766666666667 |
| 8 | HDFC Mutual Fund buys additional 10 lakh shares of Global Health for Rs 130 crore | 1 | fact_update | YES | 0.7226911614783158 |
| 9 | Housing sales rise 19% in Apr-Jun across 9 cities despite global uncertainties | 1 | fact_update | YES | 0.7226911614783158 |
| 10 | Madhusudan Kela-backed fund buys stake in IPO-bound Steamhouse India for Rs 40 crore | 1 | fact_update | YES | 0.7226911614783158 |

## Warnings

- Real snapshot still produces low Insight grade.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `52`
- Parents: `10`
- Average angles: `1.6`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.6`
- Base report share: `0.235`
- Multi-angle parents: `6`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Average temporal tier count** — actual `1.6`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.6` / `>= 1.4`
- Average evolution role count: `1.6` / `>= 1.6`
- Base report share: `0.235` / `<= 0.55`
- Multi-angle parent count: `6` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0.4` / `<= 0.5`
