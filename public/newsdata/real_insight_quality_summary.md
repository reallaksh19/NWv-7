# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.8`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.9`
- Base report share: `0.23809523809523808`
- Multi-angle parents: `8`
- Weak parents: `0`
- Story count: `484`
- Source groups: `10`
- Content hash: `0cce94d2b1263dfc`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Reliance unveils India's biggest IPO plan as Jio Platforms files DRHP | 2 | fact_update, market_reaction | NO | 0.68321 |
| 2 | NEET-UG re-exam: Nationwide mock drill under way; security tightened | 2 | fact_update, base_report | NO | 0.6945633864516649 |
| 3 | Iran Closes Strait Of Hormuz Again Over Israel's Attacks On Lebanon | 2 | official_response, base_report | NO | 0.6485766666666667 |
| 4 | Modi ‘tough cookie’, ‘great leader’ who has been in power for over 12 years, says Trump | 2 | base_report, official_response | NO | 0.6669967197849983 |
| 5 | Three Indian-flagged oil tankers clear Strait of Hormuz, minister says - Reuters | 2 | fact_update, official_response | NO | 0.5881599999999999 |
| 6 | Indian man jailed for over 5 years in U.K.-France people smuggling case | 2 | base_report, reaction_public | NO | 0.5705933333333333 |
| 7 | JD Vance lands in Switzerland to launch talks with Iran on its nuclear programme | 2 | base_report, expert_analysis | NO | 0.5704232802150018 |
| 8 | ‘Absolutely appalling’: Starmer condemns suspected anti-Muslim attacks that injured 5 in Edinburgh | 2 | fact_update, investigative_detail | NO | 0.5565933333333333 |
| 9 | Tourist dies in Dominican Republic luxury resort fire | 3 | fact_update | NO | 0.6310239879583166 |
| 10 | Monsoon tracker LIVE / Heavy rain expected in 10 districts of Tamil Nadu | 2 | regional_followup | NO | 0.6843967197849983 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.8`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.9`
- Base report share: `0.238`
- Multi-angle parents: `8`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.6`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.8` / `>= 1.4`
- Average evolution role count: `1.9` / `>= 1.6`
- Base report share: `0.238` / `<= 0.55`
- Multi-angle parent count: `8` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
