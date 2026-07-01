# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.3`
- Average temporal tiers: `2`
- Average evolution roles: `1.8`
- Base report share: `0.18181818181818182`
- Multi-angle parents: `2`
- Weak parents: `8`
- Story count: `645`
- Source groups: `10`
- Content hash: `c3f0e097e4f901d6`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Godrej Properties acquires 47-acre land parcel in South Chennai, eyes ₹500 crore revenue | 4 | official_response, regional_followup, fact_update | NO | 0.7339383461423297 |
| 2 | ATF price cut by ₹5/litre to ₹110 on softer global oil prices | 2 | fact_update, official_response | NO | 0.59551 |
| 3 | TVS extends lead as India’s electric two-wheeler registrations surge 74% in June | 2 | market_reaction | YES | 0.7255600000000002 |
| 4 | One dies, 20 injured after massive fire breaks out at Haldia Petrochemicals pipeline in Bengal | 2 | fact_update | YES | 0.7072467197849983 |
| 5 | ICEYE chooses India for sovereign SAR mission; picks Agnikul Cosmos as launch partner | 2 | regional_followup | YES | 0.6823967197849983 |
| 6 | Finance Ministry clears ₹1.25-lakh crore for India Semiconductor Mission 2.0 | 2 | fact_update | YES | 0.6795633864516649 |
| 7 | Dayalu Ammal admitted to hospital | 2 | base_report | YES | 0.6792467197849983 |
| 8 | 'Don't want to look like America': 5 reasons why Europe is against ACs despite melting summers | 2 | base_report | YES | 0.6098300531183317 |
| 9 | No More Phone Numbers? WhatsApp Touts Usernames as Next Big Privacy Step | 2 | fact_update | YES | 0.5650933333333334 |
| 10 | U.S. Supreme Court upholds State laws banning transgender girls, women from school athletic teams | 2 | official_response | YES | 0.5282732802150019 |

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
- Average evolution roles: `1.8`
- Base report share: `0.182`
- Multi-angle parents: `2`
- Top parent angles: `3`
- Top parent children: `4`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Average visible angle count** — actual `1.3`, required `>= 1.4`. Fix: Angle-diverse child selection is not strong enough on real data.
- **Weak parent ratio** — actual `0.8`, required `<= 0.5`. Fix: Too many weak trees remain. Repair or demote weak trees after diversity repair.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Average temporal tier count: `2` / `>= 1.8`
- Average evolution role count: `1.8` / `>= 1.6`
- Base report share: `0.182` / `<= 0.55`
- Multi-angle parent count: `2` / `>= 1`
- Top parent angle count: `3` / `>= 2`
- Top parent child depth: `4` / `>= 2`
