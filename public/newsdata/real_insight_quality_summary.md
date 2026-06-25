# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.3`
- Average temporal tiers: `1.4`
- Average evolution roles: `1.3`
- Base report share: `0`
- Multi-angle parents: `3`
- Weak parents: `7`
- Story count: `682`
- Source groups: `10`
- Content hash: `70f6f3b58ec8ad54`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Walmart's Flipkart, Amazon step up India 'quick commerce' bet as competition heats up - Reuters | 2 | regional_followup, fact_update | NO | 0.6512266666666667 |
| 2 | World leaders offers solidarity and aid as country reels from quakes | 2 | official_response, fact_update | NO | 0.62551 |
| 3 | On the Taratala warehouse collapse in Kolkata | 2 | fact_update, regional_followup | NO | 0.5845100000000001 |
| 4 | Amazon CEO meets PM Modi; announces plans to invest additional $13 billion in India on cloud, AI | 2 | fact_update | YES | 0.6034766666666667 |
| 5 | IAEA chief says Iran inspections will go ahead, working on modalities | 2 | official_response | YES | 0.60076 |
| 6 | HDFC Mutual Fund buys additional 10 lakh shares of Global Health for Rs 130 crore | 1 | fact_update | YES | 0.7226911614783158 |
| 7 | Housing sales rise 19% in Apr-Jun across 9 cities despite global uncertainties | 1 | fact_update | YES | 0.7226911614783158 |
| 8 | Madhusudan Kela-backed fund buys stake in IPO-bound Steamhouse India for Rs 40 crore | 1 | fact_update | YES | 0.7226911614783158 |
| 9 | India's institutional real estate investments jump 23% to $4.3 billion in H1 2026; domestic capital hits record 64% share: JLL | 1 | fact_update | YES | 0.7226911614783158 |
| 10 | US Fed says large banks well-positioned to weather hypothetical downturn, several raise dividends | 1 | fact_update | YES | 0.7226911614783158 |

## Warnings

- Real snapshot still produces low Insight grade.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `0`
- Parents: `10`
- Average angles: `1.3`
- Average temporal tiers: `1.4`
- Average evolution roles: `1.3`
- Base report share: `0`
- Multi-angle parents: `3`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Average visible angle count** — actual `1.3`, required `>= 1.4`. Fix: Angle-diverse child selection is not strong enough on real data.
- **Average temporal tier count** — actual `1.4`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.
- **Average evolution role count** — actual `1.3`, required `>= 1.6`. Fix: C+E output should include distinct event evolution roles.
- **Weak parent ratio** — actual `0.7`, required `<= 0.5`. Fix: Too many weak trees remain. Repair or demote weak trees after diversity repair.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Base report share: `0` / `<= 0.55`
- Multi-angle parent count: `3` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
