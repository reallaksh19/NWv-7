# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.7`
- Average evolution roles: `1.6`
- Base report share: `0.09523809523809523`
- Multi-angle parents: `4`
- Weak parents: `0`
- Story count: `604`
- Source groups: `10`
- Content hash: `ae4e0a1bc73d3803`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Iran-US peace deal under threat? Israel launches strikes at Lebanon despite ceasefire, killing 5 | 2 | official_response, fact_update | NO | 0.7292467197849983 |
| 2 | Reliance unveils India's biggest IPO plan as Jio Platforms files DRHP | 2 | fact_update, market_reaction | NO | 0.68321 |
| 3 | NEET-UG re-exam: Nationwide mock drill under way; security tightened | 2 | fact_update, base_report | NO | 0.6945633864516649 |
| 4 | Modi ‘tough cookie’, ‘great leader’ who has been in power for over 12 years, says Trump | 2 | base_report, official_response | NO | 0.6669967197849983 |
| 5 | Tourist dies in Dominican Republic luxury resort fire | 3 | fact_update | NO | 0.6310239879583166 |
| 6 | Monsoon tracker LIVE / Heavy rain expected in 10 districts of Tamil Nadu | 2 | regional_followup | NO | 0.6843967197849983 |
| 7 | Tata Electronics’ Hosur iPhone factory faces health probe after contamination complaints | 2 | investigative_detail | NO | 0.60626 |
| 8 | British actress Emaa Hussen charged with trying to smuggle 320kg meth into Australia | 2 | investigative_detail | NO | 0.57751 |
| 9 | India shares drop as IT declines on Accenture shock - Reuters | 2 | market_reaction | NO | 0.5413433333333333 |
| 10 | Israeli envoy and UN official clash at hearing on children in conflict | 2 | official_response | NO | 0.5375933333333334 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.7`
- Average evolution roles: `1.6`
- Base report share: `0.095`
- Multi-angle parents: `4`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.7`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.4` / `>= 1.4`
- Average evolution role count: `1.6` / `>= 1.6`
- Base report share: `0.095` / `<= 0.55`
- Multi-angle parent count: `4` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
