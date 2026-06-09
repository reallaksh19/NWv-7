# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.7`
- Average temporal tiers: `1.4`
- Average evolution roles: `1.8`
- Base report share: `0.15`
- Multi-angle parents: `7`
- Weak parents: `0`
- Story count: `708`
- Source groups: `11`
- Content hash: `e43478acb7d6c066`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Wadhwa Group leases 33K sq ft office space in Mumbai for Rs 44 cr rental in 9-yr period | 2 | regional_followup, fact_update | NO | 0.7354933333333336 |
| 2 | Iran and Israel say they have halted strikes after first exchange of fire since truce | 2 | base_report, fact_update | NO | 0.6792467197849983 |
| 3 | CMRL pay-off case: ED calls T Veena for questioning on June 12 | 2 | investigative_detail, official_response | NO | 0.6564967197849982 |
| 4 | Tata Group units plan bond sales after year-long gap, bankers say | 2 | base_report, market_reaction | NO | 0.63526 |
| 5 | 24 Indian seafarers seek urgent help after vessel reportedly attacked off Oman coast | 2 | regional_followup, official_response | NO | 0.6174800531183318 |
| 6 | Lupin Part 4 OTT Release Date Revealed: Know When and Where to Watch it Online? | 2 | base_report, investigative_detail | NO | 0.5730933333333333 |
| 7 | SAIL, NMDC explore Russian coking coal assets, nickel supplies | 2 | investigative_detail, regional_followup | NO | 0.5723433333333332 |
| 8 | India says fire reported on oil tanker with 24 Indian sailors, all crew safe | 2 | official_response | NO | 0.6852467197849983 |
| 9 | Armenian PM Nikol Pashinyan claims victory in election seen as test of Russia’s influence | 2 | official_response | NO | 0.6843800531183317 |
| 10 | India expands nuclear arsenal to around 190 warheads, says Stockholm International Peace Research Institute | 2 | official_response | NO | 0.6814967197849984 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.7`
- Average temporal tiers: `1.4`
- Average evolution roles: `1.8`
- Base report share: `0.15`
- Multi-angle parents: `7`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.4`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.7` / `>= 1.4`
- Average evolution role count: `1.8` / `>= 1.6`
- Base report share: `0.15` / `<= 0.55`
- Multi-angle parent count: `7` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
