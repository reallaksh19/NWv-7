# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.9`
- Average temporal tiers: `1.7`
- Average evolution roles: `1.9`
- Base report share: `0.25`
- Multi-angle parents: `9`
- Weak parents: `0`
- Story count: `654`
- Source groups: `9`
- Content hash: `7c1a32add8591010`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Wadhwa Group leases 33K sq ft office space in Mumbai for Rs 44 cr rental in 9-yr period | 2 | regional_followup, fact_update | NO | 0.7514800531183317 |
| 2 | Tata Group units plan bond sales after year-long gap, bankers say | 2 | base_report, market_reaction | NO | 0.6912467197849983 |
| 3 | Who is Haji Najibullah? Ex-Taliban commander sentenced to 42 years for killings of US soldiers | 2 | fact_update, base_report | NO | 0.6660800531183316 |
| 4 | CMRL pay-off case: ED calls T Veena for questioning on June 12 | 2 | investigative_detail, official_response | NO | 0.6564967197849982 |
| 5 | NASA announces Artemis III crew; taps U.S. astronauts, Italian for mission with SpaceX, Blue Origin mooncraft | 2 | base_report, investigative_detail | NO | 0.5815232802150019 |
| 6 | When and Where to Watch Basil Joseph’s Malayalam Action-Comedy Online? | 2 | base_report, fact_update | NO | 0.5770933333333335 |
| 7 | SAIL, NMDC explore Russian coking coal assets, nickel supplies | 2 | investigative_detail, regional_followup | NO | 0.5723433333333332 |
| 8 | Manslaughter charges laid over deadly Hong Kong fire | 2 | investigative_detail, fact_update | NO | 0.5612732802150018 |
| 9 | Knife attack victim’s family calls for calm after anti-immigrant violence in Belfast | 2 | base_report, investigative_detail | NO | 0.5385933333333333 |
| 10 | Congress delegation meets ECI over rejection of Meenakshi Natarajan’s nomination | 2 | official_response | NO | 0.6814967197849984 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.9`
- Average temporal tiers: `1.7`
- Average evolution roles: `1.9`
- Base report share: `0.25`
- Multi-angle parents: `9`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.7`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.9` / `>= 1.4`
- Average evolution role count: `1.9` / `>= 1.6`
- Base report share: `0.25` / `<= 0.55`
- Multi-angle parent count: `9` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
