# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.5`
- Average evolution roles: `1.8`
- Base report share: `0.1`
- Multi-angle parents: `4`
- Weak parents: `0`
- Story count: `554`
- Source groups: `9`
- Content hash: `599a840843e6ccdc`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | TN Assembly Speaker issues notices to 4 former AIADMK MLAs on disqualification issue | 2 | base_report, official_response | NO | 0.6783967197849983 |
| 2 | Thailand princess Bajrakitiyabha dies at 47 | 2 | base_report, fact_update | NO | 0.6325800531183317 |
| 3 | Telangana CM condoles demise of renowned shooting coach Jaspal Rana | 2 | fact_update, regional_followup | NO | 0.6243300531183317 |
| 4 | Donald Trump accuses Iran of attacking Indian ships; Tehran rejects charge as ‘baseless’ | 2 | official_response, regional_followup | NO | 0.5935232802150019 |
| 5 | Elon Musk becomes world's first trillionaire as SpaceX soars in stock market debut | 2 | market_reaction | NO | 0.6721766666666666 |
| 6 | spokesperson | 2 | fact_update | NO | 0.6814967197849984 |
| 7 | Cabinet Secretary | 2 | fact_update | NO | 0.6714967197849984 |
| 8 | NTA announces more rough-work space, extended exam window for NEET-UG 2026 | 2 | fact_update | NO | 0.6636467197849983 |
| 9 | Alcoholic beverages industry asks Telangana Govt to clear ₹3,700 crore dues | 2 | fact_update | NO | 0.663563386451665 |
| 10 | 'I will come home safely': Indian sailor's last words to wife before a US strike killed him - BBC | 2 | fact_update | NO | 0.6152599999999999 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.5`
- Average evolution roles: `1.8`
- Base report share: `0.1`
- Multi-angle parents: `4`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.5`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.4` / `>= 1.4`
- Average evolution role count: `1.8` / `>= 1.6`
- Base report share: `0.1` / `<= 0.55`
- Multi-angle parent count: `4` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
