# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `2`
- Average temporal tiers: `1.7`
- Average evolution roles: `2`
- Base report share: `0.35`
- Multi-angle parents: `10`
- Weak parents: `0`
- Story count: `622`
- Source groups: `11`
- Content hash: `d5ee85f5cd5a8362`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Hormuz Strait, Nuclear Program, Lebanon: Key Terms Of US-Iran Peace Deal | 2 | official_response, base_report | NO | 0.728163386451665 |
| 2 | Elon Musk says SpaceX could bring $1 trillion in revenue by 2030 | 2 | fact_update, official_response | NO | 0.6934967197849984 |
| 3 | Sonam Wangchuk joins Cockroach Janta Party’s protest in Hyderabad; seeks Dharmendra Pradhan’s resignation | 2 | fact_update, reaction_public | NO | 0.6814967197849984 |
| 4 | Oil prices slide after US-Iran deal announced | 2 | base_report, official_response | NO | 0.6601766666666666 |
| 5 | "Grave Lapse": VD Satheesan After 3 Kerala Vice Chancellors Attend RSS Event | 2 | reaction_public, regional_followup | NO | 0.6792467197849983 |
| 6 | Indian envoy meets 20 rescued crew members of MT Jalveer | 2 | base_report, official_response | NO | 0.6714967197849984 |
| 7 | 'Boyfriend duties call,' Trudeau says after skipping Canada match to watch Perry | 2 | base_report, official_response | NO | 0.6632467197849983 |
| 8 | Rebel faction of 20 Trinamool Congress MPs decide to merge with Tripura-based Nationalist Citizens Party, meet Lok Sabha Speaker Om Birla | 2 | fact_update, base_report | NO | 0.6624967197849982 |
| 9 | Brazil woman dies after rope-jumping instructors fail to attach cord | 2 | base_report, investigative_detail | NO | 0.60616 |
| 10 | Stanford students boo Sundar Pichai, walk out during Google CEO's commencement speech | 2 | official_response, base_report | NO | 0.6132300531183317 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `2`
- Average temporal tiers: `1.7`
- Average evolution roles: `2`
- Base report share: `0.35`
- Multi-angle parents: `10`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.7`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `2` / `>= 1.4`
- Average evolution role count: `2` / `>= 1.6`
- Base report share: `0.35` / `<= 0.55`
- Multi-angle parent count: `10` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
