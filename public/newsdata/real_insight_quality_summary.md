# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.5`
- Average temporal tiers: `1.8`
- Average evolution roles: `1.8`
- Base report share: `0.15789473684210525`
- Multi-angle parents: `5`
- Weak parents: `5`
- Story count: `546`
- Source groups: `11`
- Content hash: `ce6a51ede608ba48`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Chief Election Commissioner | 2 | base_report, official_response | NO | 0.62351 |
| 2 | Trump warns Iran ‘will no longer exist’ if U.S. decides to escalate | 2 | official_response, fact_update | NO | 0.61951 |
| 3 | Russian attacks kill five in Ukraine, local officials say | 2 | fact_update, regional_followup | NO | 0.6325800531183317 |
| 4 | India rejects Pakistan’s allegations on Karachi attack | 2 | investigative_detail, official_response | NO | 0.6265800531183316 |
| 5 | Pakistan says carried out strikes along Afghanistan border, 29 militants killed | 2 | fact_update, official_response | NO | 0.5505933333333333 |
| 6 | Over 1.6 lakh children given polio vaccine in Kozhikode | 2 | fact_update | YES | 0.7111800531183317 |
| 7 | Indian humanitarian assistance reaches quake-hit Venezuela: Jaishankar | 2 | base_report | YES | 0.6814967197849984 |
| 8 | Three firefighters die battling huge wildfires on Colorado-Utah border | 2 | fact_update | YES | 0.6292600000000002 |
| 9 | Iran war developments, Fed rate path cues in focus for rupee and bonds | 2 | market_reaction | YES | 0.59626 |
| 10 | Rs 8,350 crore crash in Persistent shares explained: Why investors are worried about Nagarro deal | 1 | fact_update | YES | 0.7226911614783158 |

## Warnings

- Real snapshot still produces low Insight grade.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `76`
- Parents: `10`
- Average angles: `1.5`
- Average temporal tiers: `1.8`
- Average evolution roles: `1.8`
- Base report share: `0.158`
- Multi-angle parents: `5`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.5` / `>= 1.4`
- Average temporal tier count: `1.8` / `>= 1.8`
- Average evolution role count: `1.8` / `>= 1.6`
- Base report share: `0.158` / `<= 0.55`
- Multi-angle parent count: `5` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0.5` / `<= 0.5`
