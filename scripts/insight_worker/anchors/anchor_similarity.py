def match_event_to_anchor(event, anchors):
    best_score = 0
    best_anchor = None
    reasons = []

    for a in anchors:
        if event.get('canonicalHeadline') == a.get('title'):
            score = 0.9
            if score > best_score:
                best_score = score
                best_anchor = a
                reasons = ["Title match"]
        elif event.get('canonicalHeadline') in a.get('title', '') or a.get('title', '') in event.get('canonicalHeadline'):
             score = 0.65
             if score > best_score:
                best_score = score
                best_anchor = a
                reasons = ["Partial match"]

    if best_score >= 0.62:
        return best_anchor['id'], best_score, reasons
    return None, 0, []
