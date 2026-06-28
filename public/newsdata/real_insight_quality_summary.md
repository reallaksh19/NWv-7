# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.6`
- Average temporal tiers: `1.7`
- Average evolution roles: `1.9`
- Base report share: `0.05263157894736842`
- Multi-angle parents: `6`
- Weak parents: `4`
- Story count: `505`
- Source groups: `10`
- Content hash: `fe0a7de53cda366c`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Govt. to launch affordable digital health management system for small clinics across India | 2 | base_report, fact_update | NO | 0.6934967197849984 |
| 2 | Powerful earthquake hits Afghanistan, sending tremors across Pakistan, Delhi | 2 | regional_followup, official_response | NO | 0.6774967197849983 |
| 3 | Trump warns Iran ‘will no longer exist’ if U.S. decides to escalate | 2 | official_response, fact_update | NO | 0.61951 |
| 4 | India rejects Pakistan’s allegations on Karachi attack | 2 | investigative_detail, official_response | NO | 0.6265800531183316 |
| 5 | Teacher Eligibility Test paper postponed after leak BJP breaking political parties: Opposition - Kashmir Media Service | 2 | fact_update, investigative_detail | NO | 0.6265800531183316 |
| 6 | India News LIVE Updates, 27 June 2026: Strong earthquake jolts Jammu & Kashmir, tremors felt in Delhi-NCR - The Indian Express | 2 | regional_followup, fact_update | NO | 0.6135800531183317 |
| 7 | Over 1.6 lakh children given polio vaccine in Kozhikode | 2 | fact_update | YES | 0.7111800531183317 |
| 8 | Three firefighters die battling huge wildfires on Colorado-Utah border | 2 | fact_update | YES | 0.6092600000000001 |
| 9 | Trump warns Tehran as U.S. military strikes ‘multiple targets’ in Iran | 2 | official_response | YES | 0.5605933333333333 |
| 10 | CM Naidu disburses ₹300 crore under R&R package | 1 | official_response | YES | 0.7226911614783158 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.6`
- Average temporal tiers: `1.7`
- Average evolution roles: `1.9`
- Base report share: `0.053`
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
- Base report share: `0.053` / `<= 0.55`
- Multi-angle parent count: `6` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0.4` / `<= 0.5`
