# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1.6`
- Average temporal tiers: `1.5`
- Average evolution roles: `1.6`
- Base report share: `0.25`
- Multi-angle parents: `6`
- Weak parents: `4`
- Story count: `587`
- Source groups: `9`
- Content hash: `61f7e5b05f5fabb5`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | India’s largest private gold mine set to yield a tonne of gold a year | 2 | regional_followup, fact_update | NO | 0.712563386451665 |
| 2 | India nears 50% domestic coal use in import-based power plants | 2 | investigative_detail, fact_update | NO | 0.6843266666666666 |
| 3 | India slams Pakistan for 'unwarranted' remarks on J&K at UNSC’s Arria-formula meeting | 2 | official_response, base_report | NO | 0.6814967197849984 |
| 4 | StartupTN CEO Sivarajah Ramanathan resigns | 2 | base_report, investigative_detail | NO | 0.6756467197849984 |
| 5 | UN nuclear chief says inspectors will visit Iran sites as part of war deal | 2 | base_report, official_response | NO | 0.6052599999999999 |
| 6 | Pakistani man held French woman, children captive for 12 years; child's escape leads to rescue | 2 | investigative_detail, base_report | NO | 0.58616 |
| 7 | 2 stocks that may give returns between 16-19% | 1 | market_reaction | YES | 0.7226911614783158 |
| 8 | Why textile stocks are delivering up to 14% returns for investors on Wednesday? | 1 | market_reaction | YES | 0.7226911614783158 |
| 9 | Tata Chemicals shares rise 4% on hopes of Tata Sons listing after RBI’s new norms | 1 | fact_update | YES | 0.7096244948116492 |
| 10 | IndiGo, SpiceJet shares rally up to 4% as crude oil prices fall below pre-war levels after 42% crash | 1 | market_reaction | YES | 0.7096244948116492 |

## Warnings

- Real snapshot still produces low Insight grade.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `52`
- Parents: `10`
- Average angles: `1.6`
- Average temporal tiers: `1.5`
- Average evolution roles: `1.6`
- Base report share: `0.25`
- Multi-angle parents: `6`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Average temporal tier count** — actual `1.5`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.6` / `>= 1.4`
- Average evolution role count: `1.6` / `>= 1.6`
- Base report share: `0.25` / `<= 0.55`
- Multi-angle parent count: `6` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0.4` / `<= 0.5`
