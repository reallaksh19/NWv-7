# Real Insight Snapshot Quality

- Status: **PASS**
- Reason: -
- Grade: `C`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.6`
- Base report share: `0.1`
- Multi-angle parents: `4`
- Weak parents: `0`
- Story count: `466`
- Source groups: `11`
- Content hash: `c3fdaa2c0925dcee`

## Top parents

| # | Headline | Children | Angles | Weak | Score |
|---:|---|---:|---|---|---:|
| 1 | Donald Trump makes more u-turns on Iran | 2 | investigative_detail, base_report | NO | 0.6694800531183316 |
| 2 | CBSE re-evaluation portal goes live after delays; students report glitches | 2 | official_response, market_reaction | NO | 0.6732467197849983 |
| 3 | Pentagon bars journalists from its press office, saying it has become a ’classified space’ | 2 | base_report, official_response | NO | 0.6714967197849984 |
| 4 | Stage set for D.K. Shivakumar to over as new CM of Karnataka | 2 | regional_followup, official_response | NO | 0.6676467197849983 |
| 5 | CJI administers oath of office to five new Supreme Court judges; strength rises to 37 | 2 | official_response | NO | 0.6971633864516651 |
| 6 | Massive Russian attack on cities across Ukraine kills at least 13 people | 2 | fact_update | NO | 0.6792467197849983 |
| 7 | 'Singam' K Annamalai: BJP's Tamil Nadu Star Rose Fast, Fell Faster | 2 | market_reaction | NO | 0.6701467197849983 |
| 8 | RBI may have sold gold to save foreign reserves, BE report shows | 2 | fact_update | NO | 0.6695633864516649 |
| 9 | 30 Indians living and working illegally in US as truck drivers arrested, will be deported | 2 | investigative_detail | NO | 0.6664967197849982 |
| 10 | US To Deport 30 Indians Working Illegally As Truck Drivers | 2 | investigative_detail | NO | 0.6522467197849984 |

## Real Snapshot Ratchet Gate

- Status: **FAIL**
- Gate version: `real-insight-snapshot-ratchet-v1`
- Grade: `C`
- Score: `76`
- Parents: `10`
- Average angles: `1.4`
- Average temporal tiers: `1.6`
- Average evolution roles: `1.6`
- Base report share: `0.1`
- Multi-angle parents: `4`
- Top parent angles: `2`
- Top parent children: `2`

### Failed gates

- **Average temporal tier count** — actual `1.6`, required `>= 1.8`. Fix: C+E output should cover multiple event-time tiers, not only source buckets.

### Passed gates

- Real snapshot grade floor: `C` / `A/B/C`
- Parent cluster count: `10` / `>= 3`
- Average visible angle count: `1.4` / `>= 1.4`
- Average evolution role count: `1.6` / `>= 1.6`
- Base report share: `0.1` / `<= 0.55`
- Multi-angle parent count: `4` / `>= 1`
- Top parent angle count: `2` / `>= 2`
- Top parent child depth: `2` / `>= 2`
- Weak parent ratio: `0` / `<= 0.5`
