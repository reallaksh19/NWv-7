# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.6`
- Average temporal tiers: `1.4`
- Average evolution roles: `1.7`
- Base report share: `0.2222222222222222`
- Multi-angle parents: `6`
- Weak parents: `4`
- Story count: `457`
- Source groups: `10`
- Content hash: `23b0eddb24279acd`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Powerful earthquake hits Afghanistan, sending tremors across Pakistan, Delhi | 3 | regional_followup, official_response | NO | 0.6692477209716007 |
| 2 | Govt. to launch affordable digital health management system for small clinics across India | 2 | base_report, fact_update | NO | 0.6934967197849984 |
| 3 | Indian firm, CEO among entities sanctioned by U.S. for ‘fuelling’ civil war in Sudan | 2 | base_report, official_response | NO | 0.6814967197849984 |
| 4 | India Sends Relief Material To Quake-Hit Venezuela Under 'Operation Amistad' - The Quint | 2 | base_report, official_response | NO | 0.6669967197849983 |
| 5 | Trump warns Iran ‘will no longer exist’ if U.S. decides to escalate | 2 | official_response, fact_update | NO | 0.61951 |
| 6 | Trump likely to visit India in 2027: Rubio | 2 | base_report, official_response | NO | 0.5903433333333332 |
| 7 | Trump warns Tehran as U.S. military strikes ‘multiple targets’ in Iran | 2 | official_response | YES | 0.5405933333333333 |
| 8 | CM Naidu disburses ₹300 crore under R&R package | 1 | official_response | YES | 0.7226911614783158 |
| 9 | Tata Sons back on track in FY26 with Rs 32,000 crore profit | 1 | fact_update | YES | 0.7226911614783158 |
| 10 | DSP’s Anil Ghelani predicts ETFs, index funds will command 30% of mutual fund industry | 1 | market_reaction | YES | 0.7096244948116492 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.6`
- Average temporal tiers: `1.4`
- Average evolution roles: `1.7`
- Base report share: `0.222`
- Multi-angle parents: `6`
- Top parent angles: `2`
- Top parent children: `3`

### Failed gates

- **Average temporal tier count** — actual `1.4`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.6` / `>= 1.4`
- Average evolution role count: `1.7` / `>= 1.6`
- Base report share: `0.222` / `<= 0.55`
- Multi-angle parent count: `6` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `3` / `>= 2`
- Weak parent ratio: `0.4` / `<= 0.5`
