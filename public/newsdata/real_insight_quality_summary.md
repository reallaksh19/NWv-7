# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.7`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.7`
- Base report share: `0.23529411764705882`
- Multi-angle parents: `7`
- Weak parents: `3`
- Story count: `631`
- Source groups: `9`
- Content hash: `f7ff3da3dfc3f388`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | India’s largest private gold mine set to yield a tonne of gold a year | 2 | regional_followup, fact_update | NO | 0.712563386451665 |
| 2 | India nears 50% domestic coal use in import-based power plants | 2 | investigative_detail, fact_update | NO | 0.6843266666666666 |
| 3 | India slams Pakistan for 'unwarranted' remarks on J&K at UNSC’s Arria-formula meeting | 2 | official_response, base_report | NO | 0.6814967197849984 |
| 4 | StartupTN CEO Sivarajah Ramanathan resigns | 2 | base_report, investigative_detail | NO | 0.6756467197849984 |
| 5 | Pakistani man held French woman, children captive for 12 years; child's escape leads to rescue | 2 | investigative_detail, base_report | NO | 0.6741467197849984 |
| 6 | UN nuclear chief says inspectors will visit Iran sites as part of war deal | 2 | base_report, official_response | NO | 0.6052599999999999 |
| 7 | World leaders offers solidarity and aid as country reels from quakes | 2 | official_response, fact_update | NO | 0.5935232802150019 |
| 8 | Housing sales rise 19% in Apr-Jun across 9 cities despite global uncertainties | 1 | fact_update | YES | 0.7226911614783158 |
| 9 | Madhusudan Kela-backed fund buys stake in IPO-bound Steamhouse India for Rs 40 crore | 1 | fact_update | YES | 0.7226911614783158 |
| 10 | India's institutional real estate investments jump 23% to $4.3 billion in H1 2026; domestic capital hits record 64% share: JLL | 1 | fact_update | YES | 0.7226911614783158 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.7`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.7`
- Base report share: `0.235`
- Multi-angle parents: `7`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.6`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.7` / `>= 1.4`
- Average evolution role count: `1.7` / `>= 1.6`
- Base report share: `0.235` / `<= 0.55`
- Multi-angle parent count: `7` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0.3` / `<= 0.5`
