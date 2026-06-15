# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `2`
- Average temporal tiers: `1.7`
- Average evolution roles: `1.9`
- Base report share: `0.35`
- Multi-angle parents: `10`
- Weak parents: `0`
- Story count: `603`
- Source groups: `11`
- Content hash: `5b3e14456d67dd81`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Hormuz Strait, Nuclear Program, Lebanon: Key Terms Of US-Iran Peace Deal | 2 | official_response, base_report | NO | 0.728163386451665 |
| 2 | Oil prices slide after US-Iran deal announced | 2 | base_report, official_response | NO | 0.728163386451665 |
| 3 | Elon Musk says SpaceX could bring $1 trillion in revenue by 2030 | 2 | fact_update, official_response | NO | 0.6934967197849984 |
| 4 | "Grave Lapse": VD Satheesan After 3 Kerala Vice Chancellors Attend RSS Event | 2 | reaction_public, regional_followup | NO | 0.6792467197849983 |
| 5 | Indian envoy meets 20 rescued crew members of MT Jalveer | 2 | base_report, official_response | NO | 0.6714967197849984 |
| 6 | 'Boyfriend duties call,' Trudeau says after skipping Canada match to watch Perry | 2 | base_report, official_response | NO | 0.6632467197849983 |
| 7 | Rebel faction of 20 Trinamool Congress MPs decide to merge with Tripura-based Nationalist Citizens Party, meet Lok Sabha Speaker Om Birla | 2 | fact_update, base_report | NO | 0.6624967197849982 |
| 8 | Trump says deal to end war with Iran already signed and details to be released 'pretty soon' | 2 | base_report, official_response | NO | 0.6281899468816685 |
| 9 | India can save ₹2.27 lakh crore by easing renewable energy build limits, says study | 2 | official_response, fact_update | NO | 0.6035766666666667 |
| 10 | Stanford students boo Sundar Pichai, walk out during Google CEO's commencement speech | 2 | official_response, base_report | NO | 0.6132300531183317 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `2`
- Average temporal tiers: `1.7`
- Average evolution roles: `1.9`
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
- Average evolution role count: `1.9` / `>= 1.6`
- Base report share: `0.35` / `<= 0.55`
- Multi-angle parent count: `10` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
