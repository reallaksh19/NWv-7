# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.8`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.9`
- Base report share: `0.2`
- Multi-angle parents: `8`
- Weak parents: `2`
- Story count: `510`
- Source groups: `9`
- Content hash: `aff99a4465f4be8f`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Powerful earthquake hits Afghanistan, sending tremors across Pakistan, Delhi | 3 | regional_followup, official_response | NO | 0.6692477209716007 |
| 2 | Govt. to launch affordable digital health management system for small clinics across India | 2 | base_report, fact_update | NO | 0.6934967197849984 |
| 3 | Indian firm, CEO among entities sanctioned by U.S. for ‘fuelling’ civil war in Sudan | 2 | base_report, official_response | NO | 0.6814967197849984 |
| 4 | Sebi rejects Anil Ambani's Reliance Infra settlement application | 2 | official_response, investigative_detail | NO | 0.6583266666666667 |
| 5 | India Sends Relief Material To Quake-Hit Venezuela Under 'Operation Amistad' - The Quint | 2 | base_report, official_response | NO | 0.6669967197849983 |
| 6 | Trump warns Iran ‘will no longer exist’ if U.S. decides to escalate | 2 | official_response, fact_update | NO | 0.61951 |
| 7 | Teacher Eligibility Test paper postponed after leak BJP breaking political parties: Opposition - Kashmir Media Service | 2 | fact_update, investigative_detail | NO | 0.6265800531183316 |
| 8 | Trump likely to visit India in 2027: Rubio | 2 | base_report, official_response | NO | 0.6265800531183316 |
| 9 | Trump warns Tehran as U.S. military strikes ‘multiple targets’ in Iran | 2 | official_response | YES | 0.5605933333333333 |
| 10 | CM Naidu disburses ₹300 crore under R&R package | 1 | official_response | YES | 0.7226911614783158 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.8`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.9`
- Base report share: `0.2`
- Multi-angle parents: `8`
- Top parent angles: `2`
- Top parent children: `3`

### Failed gates

- **Average temporal tier count** — actual `1.6`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.8` / `>= 1.4`
- Average evolution role count: `1.9` / `>= 1.6`
- Base report share: `0.2` / `<= 0.55`
- Multi-angle parent count: `8` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `3` / `>= 2`
- Weak parent ratio: `0.2` / `<= 0.5`
