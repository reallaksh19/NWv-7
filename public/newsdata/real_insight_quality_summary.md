# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.8`
- Average evolution roles: `1.5`
- Base report share: `0.21052631578947367`
- Multi-angle parents: `4`
- Weak parents: `6`
- Story count: `568`
- Source groups: `10`
- Content hash: `c3cd06e386937c92`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Chief Election Commissioner | 2 | base_report, official_response | NO | 0.6874967197849983 |
| 2 | Pakistan says carried out strikes along Afghanistan border, 29 militants killed | 2 | fact_update, official_response | NO | 0.6385800531183317 |
| 3 | India rejects Pakistan’s allegations on Karachi attack | 2 | investigative_detail, official_response | NO | 0.6265800531183316 |
| 4 | TVS Cheema Foundation to provide interest-free loans to Engineering, nursing and diploma students | 2 | regional_followup, base_report | NO | 0.6019100000000001 |
| 5 | Indian humanitarian assistance reaches quake-hit Venezuela: Jaishankar | 2 | base_report | YES | 0.6814967197849984 |
| 6 | ₹1.10 crore donated to TTD for two schemes | 2 | fact_update | YES | 0.6218933333333334 |
| 7 | Iran war developments, Fed rate path cues in focus for rupee and bonds | 2 | market_reaction | YES | 0.59626 |
| 8 | Private channel suspended in Pakistan for 15 days over sectarian content | 2 | official_response | YES | 0.6115800531183317 |
| 9 | US Supreme Court expands presidential powers, backs Trump's firing; Fed's Lisa Cook spared for now | 2 | official_response | YES | 0.56426 |
| 10 | Espire Hospitality posts revenue of Rs 141 crore for FY26, PAT at Rs 8 crore | 1 | fact_update | YES | 0.7226911614783158 |

## Warnings

- Real snapshot still produces low Insight grade.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `42`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.8`
- Average evolution roles: `1.5`
- Base report share: `0.211`
- Multi-angle parents: `4`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Average evolution role count** — actual `1.5`, required `>= 1.6`. Fix: C+E output should include distinct event evolution roles.
- **Weak parent ratio** — actual `0.6`, required `<= 0.5`. Fix: Too many weak trees remain. Repair or demote weak trees after diversity repair.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.4` / `>= 1.4`
- Average temporal tier count: `1.8` / `>= 1.8`
- Base report share: `0.211` / `<= 0.55`
- Multi-angle parent count: `4` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
