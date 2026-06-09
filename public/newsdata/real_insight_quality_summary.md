# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.6`
- Average temporal tiers: `1.7`
- Average evolution roles: `1.9`
- Base report share: `0.09523809523809523`
- Multi-angle parents: `6`
- Weak parents: `0`
- Story count: `680`
- Source groups: `10`
- Content hash: `eefe2d05d7646fa1`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Iran and Israel say they have halted strikes after first exchange of fire since truce | 2 | base_report, fact_update | NO | 0.6792467197849983 |
| 2 | Private jet crash kills two pilots in Dominican Republic | 2 | fact_update, official_response | NO | 0.6265800531183316 |
| 3 | 24 Indian seafarers seek urgent help after vessel reportedly attacked off Oman coast | 2 | regional_followup, official_response | NO | 0.6174800531183318 |
| 4 | CMRL pay-off case: ED calls T Veena for questioning on June 12 | 2 | investigative_detail, official_response | NO | 0.58051 |
| 5 | Lupin Part 4 OTT Release Date Revealed: Know When and Where to Watch it Online? | 2 | base_report, investigative_detail | NO | 0.5730933333333333 |
| 6 | SAIL, NMDC explore Russian coking coal assets, nickel supplies | 2 | investigative_detail, regional_followup | NO | 0.5723433333333332 |
| 7 | Who is Hector Delion, Penn Station stabbing suspect arrested after 5 people were injured? | 3 | fact_update | NO | 0.7457477209716008 |
| 8 | India says fire reported on oil tanker with 24 Indian sailors, all crew safe | 2 | official_response | NO | 0.6852467197849983 |
| 9 | Armenian PM Nikol Pashinyan claims victory in election seen as test of Russia’s influence | 2 | official_response | NO | 0.6843800531183317 |
| 10 | India expands nuclear arsenal to around 190 warheads, says Stockholm International Peace Research Institute | 2 | official_response | NO | 0.6814967197849984 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.6`
- Average temporal tiers: `1.7`
- Average evolution roles: `1.9`
- Base report share: `0.095`
- Multi-angle parents: `6`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.7`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.6` / `>= 1.4`
- Average evolution role count: `1.9` / `>= 1.6`
- Base report share: `0.095` / `<= 0.55`
- Multi-angle parent count: `6` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
