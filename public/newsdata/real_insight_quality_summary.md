# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.3`
- Average temporal tiers: `2`
- Average evolution roles: `1.7`
- Base report share: `0.14285714285714285`
- Multi-angle parents: `3`
- Weak parents: `7`
- Story count: `618`
- Source groups: `11`
- Content hash: `252077fe680a4309`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Chief Election Commissioner | 2 | base_report, official_response | NO | 0.6874967197849983 |
| 2 | India rejects Pakistan’s allegations on Karachi attack | 2 | investigative_detail, official_response | NO | 0.6265800531183316 |
| 3 | Pakistan says carried out strikes along Afghanistan border, 29 militants killed | 2 | fact_update, official_response | NO | 0.5705933333333333 |
| 4 | Over 1.6 lakh children given polio vaccine in Kozhikode | 2 | fact_update | YES | 0.7111800531183317 |
| 5 | Indian humanitarian assistance reaches quake-hit Venezuela: Jaishankar | 2 | base_report | YES | 0.6814967197849984 |
| 6 | Three firefighters die battling huge wildfires on Colorado-Utah border | 2 | fact_update | YES | 0.6292600000000002 |
| 7 | ₹1.10 crore donated to TTD for two schemes | 2 | fact_update | YES | 0.6218933333333334 |
| 8 | Iran war developments, Fed rate path cues in focus for rupee and bonds | 2 | market_reaction | YES | 0.59626 |
| 9 | Zelenskyy condemns ’horrific attacks’ as Russian strikes kill 8, wound 35 in Ukraine | 3 | fact_update | YES | 0.5752583349983151 |
| 10 | Private channel suspended in Pakistan for 15 days over sectarian content | 2 | official_response | YES | 0.5555933333333334 |

## Warnings

- Real snapshot still produces low Insight grade.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `42`
- Parents: `10`
- Average angles: `1.3`
- Average temporal tiers: `2`
- Average evolution roles: `1.7`
- Base report share: `0.143`
- Multi-angle parents: `3`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Average visible angle count** — actual `1.3`, required `>= 1.4`. Fix: Angle-diverse child selection is not strong enough on real data.
- **Weak parent ratio** — actual `0.7`, required `<= 0.5`. Fix: Too many weak trees remain. Repair or demote weak trees after diversity repair.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Average temporal tier count: `2` / `>= 1.8`
- Average evolution role count: `1.7` / `>= 1.6`
- Base report share: `0.143` / `<= 0.55`
- Multi-angle parent count: `3` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
