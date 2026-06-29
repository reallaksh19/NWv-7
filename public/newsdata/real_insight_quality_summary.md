# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.9`
- Average evolution roles: `1.7`
- Base report share: `0.2`
- Multi-angle parents: `4`
- Weak parents: `6`
- Story count: `598`
- Source groups: `11`
- Content hash: `9561b32c70031dab`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Chief Election Commissioner | 2 | base_report, official_response | NO | 0.6874967197849983 |
| 2 | Pakistan says carried out strikes along Afghanistan border, 29 militants killed | 2 | fact_update, official_response | NO | 0.6385800531183317 |
| 3 | India rejects Pakistan’s allegations on Karachi attack | 2 | investigative_detail, official_response | NO | 0.6265800531183316 |
| 4 | TVS Cheema Foundation to provide interest-free loans to Engineering, nursing and diploma students | 2 | regional_followup, base_report | NO | 0.6019100000000001 |
| 5 | Indian humanitarian assistance reaches quake-hit Venezuela: Jaishankar | 2 | base_report | YES | 0.6814967197849984 |
| 6 | Three firefighters die battling huge wildfires on Colorado-Utah border | 2 | fact_update | YES | 0.6732467197849983 |
| 7 | ₹1.10 crore donated to TTD for two schemes | 2 | fact_update | YES | 0.6218933333333334 |
| 8 | Iran war developments, Fed rate path cues in focus for rupee and bonds | 2 | market_reaction | YES | 0.59626 |
| 9 | Zelenskyy condemns ’horrific attacks’ as Russian strikes kill 8, wound 35 in Ukraine | 2 | fact_update | YES | 0.5705933333333333 |
| 10 | US Supreme Court expands presidential powers, backs Trump's firing; Fed's Lisa Cook spared for now | 2 | official_response | YES | 0.56426 |

## Warnings

- Real snapshot still produces low Insight grade.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `66`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.9`
- Average evolution roles: `1.7`
- Base report share: `0.2`
- Multi-angle parents: `4`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Weak parent ratio** — actual `0.6`, required `<= 0.5`. Fix: Too many weak trees remain. Repair or demote weak trees after diversity repair.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.4` / `>= 1.4`
- Average temporal tier count: `1.9` / `>= 1.8`
- Average evolution role count: `1.7` / `>= 1.6`
- Base report share: `0.2` / `<= 0.55`
- Multi-angle parent count: `4` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
