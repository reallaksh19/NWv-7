# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.3`
- Average temporal tiers: `1.9`
- Average evolution roles: `1.6`
- Base report share: `0.14285714285714285`
- Multi-angle parents: `3`
- Weak parents: `7`
- Story count: `673`
- Source groups: `10`
- Content hash: `386091e222fdcfdf`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Godrej Properties acquires 47-acre land parcel in South Chennai, eyes ₹500 crore revenue | 3 | regional_followup, fact_update | NO | 0.7039154013449328 |
| 2 | Three held for bid to bribe TVK MLA to vote against Speaker in no-confidence motion | 2 | base_report, investigative_detail | NO | 0.60551 |
| 3 | ATF price cut by ₹5/litre to ₹110 on softer global oil prices | 2 | fact_update, official_response | NO | 0.59551 |
| 4 | TVS extends lead as India’s electric two-wheeler registrations surge 74% in June | 2 | market_reaction | YES | 0.7255600000000002 |
| 5 | Starmer's defence investment plan leaves £5 billion funding gap for Burnham | 2 | fact_update | YES | 0.680563386451665 |
| 6 | ICEYE chooses India for sovereign SAR mission; picks Agnikul Cosmos as launch partner | 2 | regional_followup | YES | 0.6823967197849983 |
| 7 | Finance Ministry clears ₹1.25-lakh crore for India Semiconductor Mission 2.0 | 2 | fact_update | YES | 0.6795633864516649 |
| 8 | Dayalu Ammal admitted to hospital | 2 | base_report | YES | 0.6792467197849983 |
| 9 | U.S. Supreme Court upholds State laws banning transgender girls, women from school athletic teams | 2 | official_response | YES | 0.6522467197849984 |
| 10 | Ritabrata Banerjee-led Trinamool faction to meet Election Commission | 2 | official_response | YES | 0.60326 |

## Warnings

- Real snapshot still produces low Insight grade.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `42`
- Parents: `10`
- Average angles: `1.3`
- Average temporal tiers: `1.9`
- Average evolution roles: `1.6`
- Base report share: `0.143`
- Multi-angle parents: `3`
- Top parent angles: `2`
- Top parent children: `3`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Average visible angle count** — actual `1.3`, required `>= 1.4`. Fix: Angle-diverse child selection is not strong enough on real data.
- **Weak parent ratio** — actual `0.7`, required `<= 0.5`. Fix: Too many weak trees remain. Repair or demote weak trees after diversity repair.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Average temporal tier count: `1.9` / `>= 1.8`
- Average evolution role count: `1.6` / `>= 1.6`
- Base report share: `0.143` / `<= 0.55`
- Multi-angle parent count: `3` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `3` / `>= 2`
