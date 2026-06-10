# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.4`
- Average evolution roles: `1.6`
- Base report share: `0.15789473684210525`
- Multi-angle parents: `4`
- Weak parents: `1`
- Story count: `602`
- Source groups: `10`
- Content hash: `79e479b42ffeb52d`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Wadhwa Group leases 33K sq ft office space in Mumbai for Rs 44 cr rental in 9-yr period | 2 | regional_followup, fact_update | NO | 0.7514800531183317 |
| 2 | CMRL pay-off case: ED calls T Veena for questioning on June 12 | 2 | investigative_detail, official_response | NO | 0.6564967197849982 |
| 3 | Lupin Part 4 OTT Release Date Revealed: Know When and Where to Watch it Online? | 2 | base_report, investigative_detail | NO | 0.5730933333333333 |
| 4 | SAIL, NMDC explore Russian coking coal assets, nickel supplies | 2 | investigative_detail, regional_followup | NO | 0.5723433333333332 |
| 5 | 6.1 magnitude earthquake hits offshore Cuba; tremors felt in Florida | 2 | fact_update | NO | 0.6874967197849983 |
| 6 | How one of India's most successful female politicians is losing her party | 2 | base_report | NO | 0.6832467197849983 |
| 7 | India expands nuclear arsenal to around 190 warheads, says Stockholm International Peace Research Institute | 2 | official_response | NO | 0.6814967197849984 |
| 8 | RBI offers concessional swaps, allows leverage for NRI deposits to drive forex inflows | 2 | official_response | NO | 0.60626 |
| 9 | Congress candidate from Madhya Pradesh Meenakshi Natarajan’s nomination rejected | 2 | official_response | NO | 0.59551 |
| 10 | Ola Electric shares jump 10%, surge 120% in just 12 weeks. Does this rally have more steam left? | 1 | market_reaction | YES | 0.7226911614783158 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.4`
- Average evolution roles: `1.6`
- Base report share: `0.158`
- Multi-angle parents: `4`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.4`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.4` / `>= 1.4`
- Average evolution role count: `1.6` / `>= 1.6`
- Base report share: `0.158` / `<= 0.55`
- Multi-angle parent count: `4` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0.1` / `<= 0.5`
