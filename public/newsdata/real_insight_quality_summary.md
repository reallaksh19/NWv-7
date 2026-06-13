# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.5`
- Average evolution roles: `1.7`
- Base report share: `0.13636363636363635`
- Multi-angle parents: `4`
- Weak parents: `0`
- Story count: `609`
- Source groups: `10`
- Content hash: `2e1b2bd26d60191c`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Donald Trump accuses Iran of attacking Indian ships; Tehran rejects charge as ‘baseless’ | 2 | official_response, regional_followup | NO | 0.6934967197849984 |
| 2 | TN Assembly Speaker issues notices to 4 former AIADMK MLAs on disqualification issue | 2 | base_report, official_response | NO | 0.6783967197849983 |
| 3 | U.S. Justice Department clears Paramount's acquisition of Warner Bros | 2 | expert_analysis, official_response | NO | 0.6714967197849984 |
| 4 | LT Gen Dhiraj Seth appointed next Army Chief | 4 | fact_update, base_report | NO | 0.5968623727449995 |
| 5 | Elon Musk becomes world's first trillionaire as SpaceX soars in stock market debut | 2 | market_reaction | NO | 0.6721766666666666 |
| 6 | Cabinet Secretary | 2 | fact_update | NO | 0.6714967197849984 |
| 7 | Jaishankar speaks to Rubio, lodges strong protest over US Navy attacks that killed 3 Indians | 2 | fact_update | NO | 0.6664967197849982 |
| 8 | Alcoholic beverages industry asks Telangana Govt to clear ₹3,700 crore dues | 2 | fact_update | NO | 0.663563386451665 |
| 9 | Higher Education Minister | 2 | official_response | NO | 0.6591467197849983 |
| 10 | Attacks on ships ‘unacceptable’, says India; Trump blames Iran | 2 | official_response | NO | 0.6525800531183317 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.5`
- Average evolution roles: `1.7`
- Base report share: `0.136`
- Multi-angle parents: `4`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.5`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.4` / `>= 1.4`
- Average evolution role count: `1.7` / `>= 1.6`
- Base report share: `0.136` / `<= 0.55`
- Multi-angle parent count: `4` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
