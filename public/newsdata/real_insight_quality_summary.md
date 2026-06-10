# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.2`
- Average evolution roles: `1.5`
- Base report share: `0.17647058823529413`
- Multi-angle parents: `4`
- Weak parents: `3`
- Story count: `554`
- Source groups: `10`
- Content hash: `15ece39315eb119d`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Wadhwa Group leases 33K sq ft office space in Mumbai for Rs 44 cr rental in 9-yr period | 2 | regional_followup, fact_update | NO | 0.7514800531183317 |
| 2 | CMRL pay-off case: ED calls T Veena for questioning on June 12 | 2 | investigative_detail, official_response | NO | 0.6564967197849982 |
| 3 | Lupin Part 4 OTT Release Date Revealed: Know When and Where to Watch it Online? | 2 | base_report, investigative_detail | NO | 0.5730933333333333 |
| 4 | SAIL, NMDC explore Russian coking coal assets, nickel supplies | 2 | investigative_detail, regional_followup | NO | 0.5723433333333332 |
| 5 | 6.1 magnitude earthquake hits offshore Cuba; tremors felt in Florida | 2 | fact_update | NO | 0.6874967197849983 |
| 6 | How one of India's most successful female politicians is losing her party | 2 | base_report | NO | 0.6832467197849983 |
| 7 | Congress candidate from Madhya Pradesh Meenakshi Natarajan’s nomination rejected | 2 | official_response | NO | 0.59551 |
| 8 | NLC India drops 3% even as gov OFS draws robust institutional demand; retail window opens today | 1 | market_reaction | YES | 0.7226911614783158 |
| 9 | Ola Electric shares jump 10%, surge 120% in just 12 weeks. Does this rally have more steam left? | 1 | market_reaction | YES | 0.7226911614783158 |
| 10 | DIIs' net purchases cross Rs 4 lakh crore on Dalal Street in 2026 while FIIs run away | 1 | fact_update | YES | 0.7226911614783158 |

## Warnings

- Real snapshot still produces low Insight grade.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `28`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.2`
- Average evolution roles: `1.5`
- Base report share: `0.176`
- Multi-angle parents: `4`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Average temporal tier count** — actual `1.2`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.
- **Average evolution role count** — actual `1.5`, required `>= 1.6`. Fix: C+E output should include distinct event evolution roles.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.4` / `>= 1.4`
- Base report share: `0.176` / `<= 0.55`
- Multi-angle parent count: `4` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0.3` / `<= 0.5`
