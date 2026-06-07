# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `D`
- Parents: `10`
- Average angles: `1`
- Average temporal tiers: `1.1`
- Average evolution roles: `1.2`
- Base report share: `0`
- Multi-angle parents: `0`
- Weak parents: `6`
- Story count: `207`
- Source groups: `10`
- Content hash: `e3a6bd6ace173390`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | NTA releases NEET-UG 2026 re-exam city intimation slip; test on June 21 | 2 | regional_followup | NO | 0.6601766666666666 |
| 2 | Union Minister On Success Of J&K's Lavender Fields, Breaking Startup Myths | 2 | fact_update | NO | 0.6422467197849984 |
| 3 | Trump says he would not unfreeze Iran's assets before peace deal is done | 2 | official_response | NO | 0.5759232802150018 |
| 4 | Nuclear fears resurface, Kyiv says Russian attack ‘deliberate' | 2 | official_response | NO | 0.5075933333333333 |
| 5 | NSE investor accounts cross 26 crore milestone as mobile trading and tier-2/3 cities drive participation | 1 | market_reaction | YES | 0.7226911614783158 |
| 6 | 15 penny stocks surge up to 80% in 3 months. Do you own any? | 1 | fact_update | YES | 0.7226911614783158 |
| 7 | Swiggy among 9 largecap stocks with up to 45% upside potential. Do you own any? | 1 | market_reaction | YES | 0.6965578281449826 |
| 8 | Macquarie initiates 'Underperform' rating on Meesho, sees 25% downside. Here's why | 1 | reaction_public | YES | 0.6965578281449826 |
| 9 | Vanguard’s India Portfolio: 12 stocks surge up to 87% in CY26; 2 new Q4 entrants | 1 | market_reaction | YES | 0.6965578281449826 |
| 10 | Why Groww MF's equity chief is betting on multicap strategies | 1 | market_reaction | YES | 0.6834911614783159 |

## Warnings

- Real snapshot still produces low Insight grade.
- No multi-angle parent found in real snapshot output.
- Top parent has fewer than two visible angles.

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `D`
- Score: `0`
- Parents: `10`
- Average angles: `1`
- Average temporal tiers: `1.1`
- Average evolution roles: `1.2`
- Base report share: `0`
- Multi-angle parents: `0`
- Top parent angles: `1`
- Top parent children: `2`

### Failed gates

- **Real snapshot grade floor** — actual `D`, required `A/B/C`. Fix: Do not accept D/F real snapshot output. Improve child selection, parent rerank, or data intake.
- **Average visible angle count** — actual `1`, required `>= 1.4`. Fix: Angle-diverse child selection is not strong enough on real data.
- **Average temporal tier count** — actual `1.1`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.
- **Average evolution role count** — actual `1.2`, required `>= 1.6`. Fix: C+E output should include distinct event evolution roles.
- **Multi-angle parent count** — actual `0`, required `>= 1`. Fix: At least one real parent must contain two or more visible angles.
- **Top parent angle count** — actual `1`, required `>= 2`. Fix: Top Insight story is still single-angle. Demote it or enrich it.
- **Weak parent ratio** — actual `0.6`, required `<= 0.5`. Fix: Too many weak trees remain. Repair or demote weak trees after diversity repair.

### Passed gates

- Parent cluster count: `10` / `>= 3`
- Base report share: `0` / `<= 0.55`
- Top parent child depth: `2` / `>= 2`
