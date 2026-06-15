# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.7`
- Average temporal tiers: `1.5`
- Average evolution roles: `2`
- Base report share: `0.25`
- Multi-angle parents: `7`
- Weak parents: `0`
- Story count: `526`
- Source groups: `11`
- Content hash: `e6663269a4980257`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Elon Musk says SpaceX could bring $1 trillion in revenue by 2030 | 2 | fact_update, official_response | NO | 0.7374967197849984 |
| 2 | Sonam Wangchuk joins Cockroach Janta Party’s protest in Hyderabad; seeks Dharmendra Pradhan’s resignation | 2 | fact_update, reaction_public | NO | 0.6814967197849984 |
| 3 | Rebel faction of 20 Trinamool Congress MPs decide to merge with Tripura-based Nationalist Citizens Party, meet Lok Sabha Speaker Om Birla | 2 | fact_update, base_report | NO | 0.6624967197849982 |
| 4 | Oil prices slide after US-Iran deal announced | 2 | base_report, official_response | NO | 0.6281899468816685 |
| 5 | Indian envoy meets 20 rescued crew members of MT Jalveer | 2 | base_report, official_response | NO | 0.59551 |
| 6 | 'Boyfriend duties call,' Trudeau says after skipping Canada match to watch Perry | 2 | base_report, official_response | NO | 0.5952599999999999 |
| 7 | Stanford students boo Sundar Pichai, walk out during Google CEO's commencement speech | 2 | official_response, base_report | NO | 0.5252433333333333 |
| 8 | Mechanised sailing vessel experiences engine failure off coast of Oman | 2 | regional_followup | NO | 0.6783967197849983 |
| 9 | Who was Gurbhej Singh? Punjab man killed in London stabbing had moved to UK in 2022 | 2 | fact_update | NO | 0.6780967197849983 |
| 10 | Trump warns Israel not to blow up Iran deal | 2 | official_response | NO | 0.6538300531183316 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.7`
- Average temporal tiers: `1.5`
- Average evolution roles: `2`
- Base report share: `0.25`
- Multi-angle parents: `7`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.5`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.7` / `>= 1.4`
- Average evolution role count: `2` / `>= 1.6`
- Base report share: `0.25` / `<= 0.55`
- Multi-angle parent count: `7` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
