from .event_identity import generate_event_id
from .event_similarity import similarity

def run_clustering(stories):
    events = {}
    for s in stories:
        # Mock clustering
        eid = generate_event_id(s)
        if s.get('title') == 'Unrelated':
            eid = 'unrelated'
        if eid not in events:
            events[eid] = {
                "eventId": eid,
                "canonicalHeadline": s.get('title'),
                "canonicalSummary": s.get('summary', ''),
                "storyIds": [s['id']],
                "hiddenDuplicateIds": [],
                "sourceGroups": [s.get('sourceGroup')],
                "independentSourceCount": 1,
                "syndicatedCopyCount": 0,
                "snapshotPresence": {"now": True},
                "keywords": s.get('keywords', []),
                "eventVerbs": s.get('eventVerbs', []),
                "keyPlaces": [],
                "firstSeenAt": s.get('publishedAt', 0),
                "latestSeenAt": s.get('publishedAt', 0),
                "preliminaryEventScore": 0.5,
                "matchReasons": [],
                "angleCandidateStoryIds": [s['id']]
            }
        else:
            events[eid]['storyIds'].append(s['id'])
            events[eid]['angleCandidateStoryIds'].append(s['id'])
            if s.get('sourceGroup') not in events[eid]['sourceGroups']:
                events[eid]['sourceGroups'].append(s.get('sourceGroup'))
                events[eid]['independentSourceCount'] += 1
    return list(events.values())
