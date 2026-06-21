# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.5`
- Average evolution roles: `1.7`
- Base report share: `0.09523809523809523`
- Multi-angle parents: `4`
- Weak parents: `1`
- Story count: `488`
- Source groups: `9`
- Content hash: `561e3b237ed1c646`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Reliance unveils India's biggest IPO plan as Jio Platforms files DRHP | 3 | fact_update, market_reaction | NO | 0.700216206850575 |
| 2 | Iran-US peace deal under threat? Israel launches strikes at Lebanon despite ceasefire, killing 5 | 2 | official_response, fact_update | NO | 0.7292467197849983 |
| 3 | NEET-UG re-exam: Nationwide mock drill under way; security tightened | 2 | fact_update, base_report | NO | 0.6945633864516649 |
| 4 | Modi ‘tough cookie’, ‘great leader’ who has been in power for over 12 years, says Trump | 2 | base_report, official_response | NO | 0.6669967197849983 |
| 5 | Tourist dies in Dominican Republic luxury resort fire | 3 | fact_update | NO | 0.6310239879583166 |
| 6 | Monsoon tracker LIVE / Heavy rain expected in 10 districts of Tamil Nadu | 2 | regional_followup | NO | 0.6843967197849983 |
| 7 | Rs 28 LPA in Bengaluru or $60K per year in US: Indian student on F-1 visa asks which one is wiser to choose | 2 | regional_followup | NO | 0.6288300531183316 |
| 8 | 'Can I survive with Rs 6 crore in India without a job?' Indian man on Green Card queue gets laid off | 2 | fact_update | NO | 0.6186467197849984 |
| 9 | Israeli envoy and UN official clash at hearing on children in conflict | 2 | official_response | NO | 0.5375933333333334 |
| 10 | Nithin Kamath explains why India has few businesses like this ‘cash generating machine’ | 1 | fact_update | YES | 0.7226911614783158 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.5`
- Average evolution roles: `1.7`
- Base report share: `0.095`
- Multi-angle parents: `4`
- Top parent angles: `2`
- Top parent children: `3`

### Failed gates

- **Average temporal tier count** — actual `1.5`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.4` / `>= 1.4`
- Average evolution role count: `1.7` / `>= 1.6`
- Base report share: `0.095` / `<= 0.55`
- Multi-angle parent count: `4` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `3` / `>= 2`
- Weak parent ratio: `0.1` / `<= 0.5`
