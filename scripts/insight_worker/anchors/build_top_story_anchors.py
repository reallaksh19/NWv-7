import uuid
import datetime

def build_anchors(stories):
    anchors = []
    for s in stories:
        if s.get('section') == 'sports':
            continue
        anchors.append({
            "id": f"anchor-{uuid.uuid4()}",
            "title": s.get('title'),
            "summary": s.get('summary', ''),
            "source": s.get('source'),
            "sourceGroup": s.get('sourceGroup'),
            "url": s.get('url', ''),
            "publishedAt": s.get('publishedAt', 0),
            "impactScore": 0.8,
            "section": s.get('section'),
            "tier": s.get('tier', 'C'),
            "entities": [],
            "keywords": [],
            "eventVerbs": [],
            "canonicalText": s.get('title')
        })
    return {
        "schemaVersion": "1.0.0",
        "generatedAt": datetime.datetime.utcnow().isoformat() + "Z",
        "sourceMode": "workflow",
        "anchorPolicy": {
            "usesUserVisibleFilteredTopStories": False,
            "usesReadSuppression": False,
            "usesViewCountSuppression": False,
            "usesCustomSortTopStories": False
        },
        "anchors": anchors
    }
