# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.6`
- Average temporal tiers: `1.5`
- Average evolution roles: `2`
- Base report share: `0.2857142857142857`
- Multi-angle parents: `6`
- Weak parents: `0`
- Story count: `615`
- Source groups: `11`
- Content hash: `93463ad3db7293ab`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | India’s REITs and InvITs market may attract Rs 11.6 lakh crore by 2030: Avendus | 2 | fact_update, market_reaction | NO | 0.7685467197849984 |
| 2 | Smriti Mandhana only Indian among TIME magazine's 100 most influential sportspersons | 3 | base_report, fact_update | NO | 0.6735810543049341 |
| 3 | UNSC reform would border on failure if only non-permanent category expanded: India | 2 | base_report, fact_update | NO | 0.6778467197849983 |
| 4 | G7 Summit Day 1 LIVE: G7 leaders open summit talks on Ukraine and West Asia as Zelenskyy joins in France | 2 | base_report, fact_update | NO | 0.61726 |
| 5 | Bangladesh protests India 'questioning' PM's adviser at Delhi airport - Reuters | 2 | investigative_detail, reaction_public | NO | 0.60901 |
| 6 | US renames ‘Indo-Pacific Command’ to ‘US Pacific Command’ title in major move | 2 | base_report, official_response | NO | 0.59151 |
| 7 | Plane Crashes On Texas Highway, Cockpit Window Broken For Rescue | 2 | base_report | NO | 0.7072467197849983 |
| 8 | Rupee closes at 94.56 vs USD; US-Iran peace agreement details, Fed guidance awaited | 2 | market_reaction | NO | 0.7012467197849983 |
| 9 | 6.7 magnitude earthquake strikes Indonesia’s Sulawesi island, no tsunami threat | 2 | fact_update | NO | 0.6834967197849984 |
| 10 | India seeks rare earth samples from Rosneft-owned Siberian deposit, source says - Reuters | 2 | official_response | NO | 0.62166 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.6`
- Average temporal tiers: `1.5`
- Average evolution roles: `2`
- Base report share: `0.286`
- Multi-angle parents: `6`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.5`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.6` / `>= 1.4`
- Average evolution role count: `2` / `>= 1.6`
- Base report share: `0.286` / `<= 0.55`
- Multi-angle parent count: `6` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
