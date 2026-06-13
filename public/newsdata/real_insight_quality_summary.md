# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.5`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.9`
- Base report share: `0.15`
- Multi-angle parents: `5`
- Weak parents: `0`
- Story count: `599`
- Source groups: `10`
- Content hash: `5c3d7e912a798f39`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | TN Assembly Speaker issues notices to 4 former AIADMK MLAs on disqualification issue | 2 | base_report, official_response | NO | 0.6783967197849983 |
| 2 | India sees $3 billion debt fundraising rush as yields slump after RBI moves, bankers say | 2 | fact_update, official_response | NO | 0.6583266666666667 |
| 3 | Navi Mumbai's power crisis had reached a breaking point - India Today - India Today | 2 | base_report, fact_update | NO | 0.6265800531183316 |
| 4 | Telangana CM condoles demise of renowned shooting coach Jaspal Rana | 2 | fact_update, regional_followup | NO | 0.6243300531183317 |
| 5 | Thailand princess Bajrakitiyabha dies at 47 | 2 | base_report, fact_update | NO | 0.5645933333333333 |
| 6 | Elon Musk becomes world's first trillionaire as SpaceX soars in stock market debut | 2 | market_reaction | NO | 0.6721766666666666 |
| 7 | spokesperson | 2 | fact_update | NO | 0.6814967197849984 |
| 8 | NTA announces more rough-work space, extended exam window for NEET-UG 2026 | 2 | fact_update | NO | 0.6636467197849983 |
| 9 | TN Chief Minister Vijay seeks greater Central support at NITI Aayog meet | 2 | official_response | NO | 0.6573967197849983 |
| 10 | Cabinet Secretary | 2 | fact_update | NO | 0.61951 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.5`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.9`
- Base report share: `0.15`
- Multi-angle parents: `5`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.6`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.5` / `>= 1.4`
- Average evolution role count: `1.9` / `>= 1.6`
- Base report share: `0.15` / `<= 0.55`
- Multi-angle parent count: `5` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
