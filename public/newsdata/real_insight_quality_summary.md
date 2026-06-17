# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.7`
- Average temporal tiers: `1.6`
- Average evolution roles: `2.1`
- Base report share: `0.2727272727272727`
- Multi-angle parents: `6`
- Weak parents: `0`
- Story count: `611`
- Source groups: `10`
- Content hash: `0765cbfe089d80a8`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Bangladesh protests India 'questioning' PM's adviser at Delhi airport - Reuters | 3 | official_response, investigative_detail, reaction_public | NO | 0.6418462101805388 |
| 2 | India’s REITs and InvITs market may attract Rs 11.6 lakh crore by 2030: Avendus | 2 | fact_update, market_reaction | NO | 0.7685467197849984 |
| 3 | Trump says deal to end war with Iran already signed and details to be released 'pretty soon' | 2 | base_report, official_response | NO | 0.728163386451665 |
| 4 | UNSC reform would border on failure if only non-permanent category expanded: India | 2 | base_report, fact_update | NO | 0.6778467197849983 |
| 5 | Smriti Mandhana only Indian among TIME magazine's 100 most influential sportspersons | 3 | base_report, fact_update | NO | 0.6096239879583165 |
| 6 | G7 Summit Day 1 LIVE: G7 leaders open summit talks on Ukraine and West Asia as Zelenskyy joins in France | 2 | base_report, fact_update | NO | 0.61726 |
| 7 | Rupee closes at 94.56 vs USD; US-Iran peace agreement details, Fed guidance awaited | 2 | market_reaction | NO | 0.7012467197849983 |
| 8 | 6.7 magnitude earthquake strikes Indonesia’s Sulawesi island, no tsunami threat | 2 | fact_update | NO | 0.6834967197849984 |
| 9 | India seeks rare earth samples from Rosneft-owned Siberian deposit, source says - Reuters | 2 | official_response | NO | 0.62166 |
| 10 | 'Sometimes Trump & I don't see eye to eye': Netanyahu admits fallout with US prez over Iran war | 2 | base_report | NO | 0.6087300531183317 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.7`
- Average temporal tiers: `1.6`
- Average evolution roles: `2.1`
- Base report share: `0.273`
- Multi-angle parents: `6`
- Top parent angles: `3`
- Top parent children: `3`

### Failed gates

- **Average temporal tier count** — actual `1.6`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.7` / `>= 1.4`
- Average evolution role count: `2.1` / `>= 1.6`
- Base report share: `0.273` / `<= 0.55`
- Multi-angle parent count: `6` / `>= 1`
- Top parent angle count: `3` / `>= 2`
- Top parent child depth: `3` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
