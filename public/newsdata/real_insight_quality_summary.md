# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.5`
- Average temporal tiers: `1.8`
- Average evolution roles: `1.5`
- Base report share: `0.05`
- Multi-angle parents: `5`
- Weak parents: `5`
- Story count: `605`
- Source groups: `9`
- Content hash: `59770aeb43c4fb28`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | World leaders offers solidarity and aid as country reels from quakes | 2 | official_response, fact_update | NO | 0.6934967197849984 |
| 2 | White House asks Congress for $87.6B for Iran war, aid to US farmers, tackling Ebola crisis | 2 | official_response, fact_update | NO | 0.691563386451665 |
| 3 | On the Taratala warehouse collapse in Kolkata | 2 | fact_update, regional_followup | NO | 0.6604967197849982 |
| 4 | Snap sued over minor’s rape after she connected with assaulter on Snapchat | 2 | official_response, investigative_detail | NO | 0.6325800531183317 |
| 5 | India says it discussed pathways to interim trade deal with US - Reuters | 2 | base_report, official_response | NO | 0.5723433333333332 |
| 6 | Venezuela health minister says around 235 people dead, 4,300 injured in catastrophic earthquakes | 3 | fact_update | YES | 0.6319606512950194 |
| 7 | Amazon CEO meets PM Modi; announces plans to invest additional $13 billion in India on cloud, AI | 2 | fact_update | YES | 0.6034766666666667 |
| 8 | UN agency pauses evacuation of ships through Strait of Hormuz after attack on vessel | 2 | official_response | YES | 0.5792732802150018 |
| 9 | U.S. Supreme Court’s ruling to end protections for Haitian, Syrian immigrants could have broader impact | 2 | official_response | YES | 0.5282732802150019 |
| 10 | Goldman Sachs upgrades India's growth outlook after US-Iran peace deal | 1 | fact_update | YES | 0.7226911614783158 |

## Warnings

- Real snapshot still produces low Insight grade.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `52`
- Parents: `10`
- Average angles: `1.5`
- Average temporal tiers: `1.8`
- Average evolution roles: `1.5`
- Base report share: `0.05`
- Multi-angle parents: `5`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Average evolution role count** — actual `1.5`, required `>= 1.6`. Fix: C+E output should include distinct event evolution roles.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.5` / `>= 1.4`
- Average temporal tier count: `1.8` / `>= 1.8`
- Base report share: `0.05` / `<= 0.55`
- Multi-angle parent count: `5` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0.5` / `<= 0.5`
