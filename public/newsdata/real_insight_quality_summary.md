# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.7`
- Average temporal tiers: `1.7`
- Average evolution roles: `1.9`
- Base report share: `0.19047619047619047`
- Multi-angle parents: `7`
- Weak parents: `3`
- Story count: `475`
- Source groups: `9`
- Content hash: `fae293302790a1b0`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Powerful earthquake hits Afghanistan, sending tremors across Pakistan, Delhi | 3 | regional_followup, official_response | NO | 0.6692477209716007 |
| 2 | Govt. to launch affordable digital health management system for small clinics across India | 2 | base_report, fact_update | NO | 0.6934967197849984 |
| 3 | India rejects Pakistan’s allegations on Karachi attack | 2 | investigative_detail, official_response | NO | 0.6705800531183317 |
| 4 | Trump likely to visit India in 2027: Rubio | 3 | base_report, official_response | NO | 0.6130795435138721 |
| 5 | India Sends Relief Material To Quake-Hit Venezuela Under 'Operation Amistad' - The Quint | 2 | base_report, official_response | NO | 0.6669967197849983 |
| 6 | Trump warns Iran ‘will no longer exist’ if U.S. decides to escalate | 2 | official_response, fact_update | NO | 0.61951 |
| 7 | Teacher Eligibility Test paper postponed after leak BJP breaking political parties: Opposition - Kashmir Media Service | 2 | fact_update, investigative_detail | NO | 0.6265800531183316 |
| 8 | Over 1.6 lakh children given polio vaccine in Kozhikode | 2 | fact_update | YES | 0.7111800531183317 |
| 9 | Trump warns Tehran as U.S. military strikes ‘multiple targets’ in Iran | 2 | official_response | YES | 0.5605933333333333 |
| 10 | CM Naidu disburses ₹300 crore under R&R package | 1 | official_response | YES | 0.7226911614783158 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.7`
- Average temporal tiers: `1.7`
- Average evolution roles: `1.9`
- Base report share: `0.19`
- Multi-angle parents: `7`
- Top parent angles: `2`
- Top parent children: `3`

### Failed gates

- **Average temporal tier count** — actual `1.7`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.7` / `>= 1.4`
- Average evolution role count: `1.9` / `>= 1.6`
- Base report share: `0.19` / `<= 0.55`
- Multi-angle parent count: `7` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `3` / `>= 2`
- Weak parent ratio: `0.3` / `<= 0.5`
