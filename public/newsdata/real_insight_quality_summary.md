# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.5`
- Average temporal tiers: `1.5`
- Average evolution roles: `1.6`
- Base report share: `0.05`
- Multi-angle parents: `5`
- Weak parents: `0`
- Story count: `521`
- Source groups: `11`
- Content hash: `c31e98e846d01d32`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Trump says Starmer will resign as UK prime minister | 2 | official_response, investigative_detail | NO | 0.7120967197849983 |
| 2 | JD Vance lands in Switzerland to launch talks with Iran on its nuclear programme | 2 | base_report, expert_analysis | NO | 0.6703967197849983 |
| 3 | FM Swapan Dasgupta presents BJP’s maiden budget in the state | 2 | fact_update, official_response | NO | 0.6366433333333333 |
| 4 | Death toll rises to 5 in ammonia gas leak in fish meal export unit in Tiruvallur district | 2 | regional_followup, fact_update | NO | 0.62441 |
| 5 | ‘Absolutely appalling’: Starmer condemns suspected anti-Muslim attacks that injured 5 in Edinburgh | 2 | fact_update, investigative_detail | NO | 0.6325800531183317 |
| 6 | Trump threatens to charge U.S. tolls in Strait of Hormuz if final Iran deal not reached in 60 days | 2 | official_response | NO | 0.6724967197849983 |
| 7 | International Yoga Day 2026 LIVE: Leaders, yoga enthusiasts participate in celebrations across the country | 2 | official_response | NO | 0.6692467197849983 |
| 8 | Dipke, CJP supporters continue sit-in overnight at Jantar Mantar, urge people to join protest | 2 | reaction_public | NO | 0.6604967197849982 |
| 9 | Strong maritime capabilities deciding factor for country’s economic, strategic influence: PM Modi | 2 | official_response | NO | 0.6504967197849982 |
| 10 | After breaking WORLD RECORD, when will 15-year-old be in action again, fu - India.Com | 2 | fact_update | NO | 0.6052599999999999 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.5`
- Average temporal tiers: `1.5`
- Average evolution roles: `1.6`
- Base report share: `0.05`
- Multi-angle parents: `5`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.5`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.5` / `>= 1.4`
- Average evolution role count: `1.6` / `>= 1.6`
- Base report share: `0.05` / `<= 0.55`
- Multi-angle parent count: `5` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
