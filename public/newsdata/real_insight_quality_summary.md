# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.2`
- Average temporal tiers: `1.4`
- Average evolution roles: `1.5`
- Base report share: `0.058823529411764705`
- Multi-angle parents: `2`
- Weak parents: `3`
- Story count: `377`
- Source groups: `11`
- Content hash: `7d617d1ee040978b`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Tamil Nadu government rolls out online registration of select documents | 2 | regional_followup, official_response | NO | 0.6823967197849983 |
| 2 | Israel strikes Beirut's southern suburbs days after US-supported ceasefire deal | 2 | fact_update, base_report | NO | 0.60551 |
| 3 | NTA releases NEET-UG 2026 re-exam city intimation slip; test on June 21 | 2 | regional_followup | NO | 0.6601766666666666 |
| 4 | Six Injured In Stabbing At New York's Penn Station | 2 | fact_update | NO | 0.6519266666666668 |
| 5 | Union Minister On Success Of J&K's Lavender Fields, Breaking Startup Myths | 2 | fact_update | NO | 0.6422467197849984 |
| 6 | Trump says he would not unfreeze Iran's assets before peace deal is done | 2 | official_response | NO | 0.59991 |
| 7 | Nuclear fears resurface, Kyiv says Russian attack ‘deliberate' | 2 | official_response | NO | 0.5955800531183317 |
| 8 | TCS shares slip 2%, down 12% in 4 straight sessions. What’s triggering the decline? | 1 | market_reaction | YES | 0.7226911614783158 |
| 9 | Wipro shares crack 5%, down 8% in two sessions. What’s behind the selloff? | 1 | market_reaction | YES | 0.7226911614783158 |
| 10 | NSE investor accounts cross 26 crore milestone as mobile trading and tier-2/3 cities drive participation | 1 | market_reaction | YES | 0.7226911614783158 |

## Warnings

- Real snapshot still produces low Insight grade.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `4`
- Parents: `10`
- Average angles: `1.2`
- Average temporal tiers: `1.4`
- Average evolution roles: `1.5`
- Base report share: `0.059`
- Multi-angle parents: `2`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Average visible angle count** — actual `1.2`, required `>= 1.4`. Fix: Angle-diverse child selection is not strong enough on real data.
- **Average temporal tier count** — actual `1.4`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.
- **Average evolution role count** — actual `1.5`, required `>= 1.6`. Fix: C+E output should include distinct event evolution roles.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Base report share: `0.059` / `<= 0.55`
- Multi-angle parent count: `2` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0.3` / `<= 0.5`
