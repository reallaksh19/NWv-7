# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.7`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.8`
- Base report share: `0.15`
- Multi-angle parents: `7`
- Weak parents: `0`
- Story count: `561`
- Source groups: `11`
- Content hash: `7c494cb4fdcf1a04`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Iran Closes Strait Of Hormuz Again Over Israel's Attacks On Lebanon | 2 | official_response, base_report | NO | 0.716563386451665 |
| 2 | NEET-UG re-exam : Over 20 lakh students took the exam on Sunday under enhanced security measures | 2 | regional_followup, fact_update | NO | 0.6616433333333334 |
| 3 | ‘Absolutely appalling’: Starmer condemns suspected anti-Muslim attacks that injured 5 in Edinburgh | 2 | fact_update, investigative_detail | NO | 0.6325800531183317 |
| 4 | JD Vance lands in Switzerland to launch talks with Iran on its nuclear programme | 2 | base_report, expert_analysis | NO | 0.60241 |
| 5 | Three Indian-flagged oil tankers clear Strait of Hormuz, minister says - Reuters | 2 | fact_update, official_response | NO | 0.5881599999999999 |
| 6 | Trump says Starmer will resign as UK prime minister | 2 | official_response, investigative_detail | NO | 0.58411 |
| 7 | Indian man jailed for over 5 years in U.K.-France people smuggling case | 2 | base_report, reaction_public | NO | 0.5705933333333333 |
| 8 | International Yoga Day 2026 LIVE: Leaders, yoga enthusiasts participate in celebrations across the country | 2 | official_response | NO | 0.6692467197849983 |
| 9 | Dipke, CJP supporters continue sit-in overnight at Jantar Mantar, urge people to join protest | 2 | reaction_public | NO | 0.6085100000000001 |
| 10 | Indian prodigy Vaibhav Sooryavanshi, 15, smashes record with 11-ball half-century - The New York Times | 2 | fact_update | NO | 0.6052599999999999 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.7`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.8`
- Base report share: `0.15`
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
- Base report share: `0.15` / `<= 0.55`
- Multi-angle parent count: `7` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
