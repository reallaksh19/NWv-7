# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.7`
- Average temporal tiers: `1.5`
- Average evolution roles: `1.8`
- Base report share: `0.2`
- Multi-angle parents: `7`
- Weak parents: `0`
- Story count: `567`
- Source groups: `11`
- Content hash: `15bc26bbfe0716ce`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Iran Closes Strait Of Hormuz Again Over Israel's Attacks On Lebanon | 2 | official_response, base_report | NO | 0.716563386451665 |
| 2 | ‘Absolutely appalling’: Starmer condemns suspected anti-Muslim attacks that injured 5 in Edinburgh | 2 | fact_update, investigative_detail | NO | 0.6765800531183316 |
| 3 | NEET-UG re-exam: Nationwide mock drill under way; security tightened | 2 | fact_update, base_report | NO | 0.6945633864516649 |
| 4 | JD Vance lands in Switzerland to launch talks with Iran on its nuclear programme | 2 | base_report, expert_analysis | NO | 0.60241 |
| 5 | Three Indian-flagged oil tankers clear Strait of Hormuz, minister says - Reuters | 2 | fact_update, official_response | NO | 0.5881599999999999 |
| 6 | Trump says Starmer will resign as UK prime minister | 2 | official_response, investigative_detail | NO | 0.58411 |
| 7 | Indian man jailed for over 5 years in U.K.-France people smuggling case | 2 | base_report, reaction_public | NO | 0.5705933333333333 |
| 8 | Monsoon tracker LIVE / Heavy rain expected in 10 districts of Tamil Nadu | 2 | regional_followup | NO | 0.6843967197849983 |
| 9 | International Yoga Day 2026 LIVE: Leaders, yoga enthusiasts participate in celebrations across the country | 2 | official_response | NO | 0.6692467197849983 |
| 10 | Dipke, CJP supporters continue sit-in overnight at Jantar Mantar, urge people to join protest | 2 | reaction_public | NO | 0.6085100000000001 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.7`
- Average temporal tiers: `1.5`
- Average evolution roles: `1.8`
- Base report share: `0.2`
- Multi-angle parents: `7`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.5`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.7` / `>= 1.4`
- Average evolution role count: `1.8` / `>= 1.6`
- Base report share: `0.2` / `<= 0.55`
- Multi-angle parent count: `7` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
