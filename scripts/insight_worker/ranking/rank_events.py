def rank_events(events):
    for ev in events:
        if 'eventScoreOverride' in ev:
           ev['eventScore'] = ev['eventScoreOverride']
           continue

        topStoryAnchorScore = ev.get('topStoryAnchorScore', 0)
        freshness = 0.8
        sourceAuthority = 0.7
        indepSource = min(ev.get('independentSourceCount', 1) / 5.0, 1.0)
        persistence = ev.get('persistence24h', 0)
        rising = 0.9 if ev.get('isRising') else 0

        score = (
            0.22 * topStoryAnchorScore +
            0.14 * freshness +
            0.13 * sourceAuthority +
            0.12 * indepSource +
            0.11 * 0.5 + # factual
            0.10 * persistence +
            0.08 * rising +
            0.06 * 0.5 + # local
            0.04 * 0.5   # angle
        )

        ev['eventScore'] = score
        ev['scoreBreakdown'] = {
            "topStoryAnchorScore": topStoryAnchorScore,
            "freshness": freshness,
            "sourceAuthority": sourceAuthority,
            "indepSource": indepSource,
            "persistence": persistence,
            "rising": rising
        }

    return sorted(events, key=lambda x: x['eventScore'], reverse=True)
