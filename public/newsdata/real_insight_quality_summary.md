# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.8`
- Average evolution roles: `1.8`
- Base report share: `0.10526315789473684`
- Multi-angle parents: `4`
- Weak parents: `6`
- Story count: `504`
- Source groups: `11`
- Content hash: `c35fda902b0af559`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Trump warns Iran ‘will no longer exist’ if U.S. decides to escalate | 2 | official_response, fact_update | NO | 0.61951 |
| 2 | India rejects Pakistan’s allegations on Karachi attack | 2 | investigative_detail, official_response | NO | 0.6265800531183316 |
| 3 | Russian attacks kill five in Ukraine, local officials say | 2 | fact_update, regional_followup | NO | 0.5645933333333333 |
| 4 | Pakistan says carried out strikes along Afghanistan border, 29 militants killed | 2 | fact_update, official_response | NO | 0.5505933333333333 |
| 5 | Over 1.6 lakh children given polio vaccine in Kozhikode | 2 | fact_update | YES | 0.7111800531183317 |
| 6 | Three firefighters die battling huge wildfires on Colorado-Utah border | 2 | fact_update | YES | 0.6292600000000002 |
| 7 | Trump warns Tehran as U.S. military strikes ‘multiple targets’ in Iran | 2 | official_response | YES | 0.6165800531183316 |
| 8 | Indian humanitarian assistance reaches quake-hit Venezuela: Jaishankar | 2 | base_report | YES | 0.5815232802150019 |
| 9 | More than 1,300 excess deaths recorded in Europe heatwave: WHO | 2 | fact_update | YES | 0.5724066135483352 |
| 10 | Capri Global eyes debut dollar debt sale, starts procedure, bankers say | 1 | fact_update | YES | 0.7226911614783158 |

## Warnings

- Real snapshot still produces low Insight grade.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `66`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.8`
- Average evolution roles: `1.8`
- Base report share: `0.105`
- Multi-angle parents: `4`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Weak parent ratio** — actual `0.6`, required `<= 0.5`. Fix: Too many weak trees remain. Repair or demote weak trees after diversity repair.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.4` / `>= 1.4`
- Average temporal tier count: `1.8` / `>= 1.8`
- Average evolution role count: `1.8` / `>= 1.6`
- Base report share: `0.105` / `<= 0.55`
- Multi-angle parent count: `4` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
