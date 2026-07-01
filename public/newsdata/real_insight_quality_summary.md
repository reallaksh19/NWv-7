# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.5`
- Average temporal tiers: `2`
- Average evolution roles: `1.7`
- Base report share: `0.09523809523809523`
- Multi-angle parents: `4`
- Weak parents: `6`
- Story count: `593`
- Source groups: `11`
- Content hash: `525b525e619e62a1`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Godrej Properties acquires 47-acre land parcel in South Chennai, eyes ₹500 crore revenue | 4 | official_response, regional_followup, fact_update | NO | 0.7339383461423297 |
| 2 | Financial firms shift Asia expansion focus to South Korea, take cautious stance on China and India | 2 | expert_analysis, market_reaction | NO | 0.6272599999999999 |
| 3 | ATF price cut by ₹5/litre to ₹110 on softer global oil prices | 2 | fact_update, official_response | NO | 0.59551 |
| 4 | Apple Accuses CCI of 'Copy-Pasting' Rivals' Claims in Antitrust Investigation | 2 | investigative_detail, official_response | NO | 0.5758433333333333 |
| 5 | Finance Ministry clears ₹1.25-lakh crore for India Semiconductor Mission 2.0 | 2 | fact_update | YES | 0.6795633864516649 |
| 6 | Dayalu Ammal admitted to hospital | 2 | base_report | YES | 0.6792467197849983 |
| 7 | One dies, 20 injured after massive fire breaks out at Haldia Petrochemicals pipeline in Bengal | 2 | fact_update | YES | 0.6072732802150018 |
| 8 | ICEYE chooses India for sovereign SAR mission; picks Agnikul Cosmos as launch partner | 2 | regional_followup | YES | 0.6064100000000001 |
| 9 | U.S. Supreme Court upholds State laws banning transgender girls, women from school athletic teams | 2 | official_response | YES | 0.5282732802150019 |
| 10 | Vedanta Iron & Steel shares skyrocket 89% in 12 days since listing. What’s fuelling the surge? | 1 | market_reaction | YES | 0.7226911614783158 |

## Warnings

- Real snapshot still produces low Insight grade.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `66`
- Parents: `10`
- Average angles: `1.5`
- Average temporal tiers: `2`
- Average evolution roles: `1.7`
- Base report share: `0.095`
- Multi-angle parents: `4`
- Top parent angles: `3`
- Top parent children: `4`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Weak parent ratio** — actual `0.6`, required `<= 0.5`. Fix: Too many weak trees remain. Repair or demote weak trees after diversity repair.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.5` / `>= 1.4`
- Average temporal tier count: `2` / `>= 1.8`
- Average evolution role count: `1.7` / `>= 1.6`
- Base report share: `0.095` / `<= 0.55`
- Multi-angle parent count: `4` / `>= 1`
- Top parent angle count: `3` / `>= 2`
- Top parent child depth: `4` / `>= 2`
