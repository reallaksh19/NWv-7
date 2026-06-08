# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.8`
- Base report share: `0.05`
- Multi-angle parents: `4`
- Weak parents: `0`
- Story count: `548`
- Source groups: `11`
- Content hash: `bab8aeb2affe6867`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Tamil Nadu government rolls out online registration of select documents | 2 | regional_followup, official_response | NO | 0.6823967197849983 |
| 2 | Israel strikes Beirut's southern suburbs days after US-supported ceasefire deal | 2 | fact_update, base_report | NO | 0.6814967197849984 |
| 3 | Private jet crash kills two pilots in Dominican Republic | 2 | fact_update, official_response | NO | 0.6265800531183316 |
| 4 | 24 Indian seafarers seek urgent help after vessel reportedly attacked off Oman coast | 2 | regional_followup, official_response | NO | 0.6174800531183318 |
| 5 | NTA releases NEET-UG 2026 re-exam city intimation slip; test on June 21 | 2 | regional_followup | NO | 0.736163386451665 |
| 6 | Six Injured In Stabbing At New York's Penn Station | 2 | fact_update | NO | 0.7199133864516649 |
| 7 | Trump says he would not unfreeze Iran's assets before peace deal is done | 2 | official_response | NO | 0.6758967197849983 |
| 8 | Rupee slumps as elevated crude, Treasury yields support dollar | 2 | market_reaction | NO | 0.6742467197849984 |
| 9 | Union Minister On Success Of J&K's Lavender Fields, Breaking Startup Myths | 2 | fact_update | NO | 0.6422467197849984 |
| 10 | India says fire reported on oil tanker with 24 Indian sailors, all crew safe | 2 | official_response | NO | 0.6172599999999999 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.8`
- Base report share: `0.05`
- Multi-angle parents: `4`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.6`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.4` / `>= 1.4`
- Average evolution role count: `1.8` / `>= 1.6`
- Base report share: `0.05` / `<= 0.55`
- Multi-angle parent count: `4` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
