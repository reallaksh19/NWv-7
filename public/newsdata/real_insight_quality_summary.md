# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.5`
- Average temporal tiers: `1.7`
- Average evolution roles: `2`
- Base report share: `0.15`
- Multi-angle parents: `5`
- Weak parents: `0`
- Story count: `502`
- Source groups: `10`
- Content hash: `1947e568aea4df15`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | LT Gen Dhiraj Seth appointed next Army Chief | 2 | fact_update, base_report | NO | 0.6874967197849983 |
| 2 | RUHS CUET 2026 Counselling Registration Begins On June 16, Check Complete Schedule | 2 | market_reaction, fact_update | NO | 0.6852467197849983 |
| 3 | Sonam Wangchuk joins Cockroach Janta Party’s protest in Hyderabad; seeks Dharmendra Pradhan’s resignation | 2 | fact_update, reaction_public | NO | 0.60551 |
| 4 | Rebel faction of 20 Trinamool Congress MPs decide to merge with Tripura-based Nationalist Citizens Party, meet Lok Sabha Speaker Om Birla | 2 | fact_update, base_report | NO | 0.58651 |
| 5 | 'Boyfriend duties call,' Trudeau says after skipping Canada match to watch Perry | 2 | base_report, official_response | NO | 0.5752600000000001 |
| 6 | Amit Shah directs MHA support to panel studying demographic changes, especially in border areas | 2 | official_response | NO | 0.6874967197849983 |
| 7 | Who was Gurbhej Singh? Punjab man killed in London stabbing had moved to UK in 2022 | 2 | fact_update | NO | 0.6780967197849983 |
| 8 | Mechanised sailing vessel experiences engine failure off coast of Oman | 2 | regional_followup | NO | 0.61441 |
| 9 | PM Modi arrives in Slovakia for second leg of his two-nation visit | 2 | official_response | NO | 0.6243128795983323 |
| 10 | Trump warns Israel not to blow up Iran deal | 2 | official_response | NO | 0.5218433333333333 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.5`
- Average temporal tiers: `1.7`
- Average evolution roles: `2`
- Base report share: `0.15`
- Multi-angle parents: `5`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.7`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.5` / `>= 1.4`
- Average evolution role count: `2` / `>= 1.6`
- Base report share: `0.15` / `<= 0.55`
- Multi-angle parent count: `5` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
