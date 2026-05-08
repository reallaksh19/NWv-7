from .classify_angle import classify_angle_for_parent

def select_angles(stories, parent_event):
    selected = []
    seen_angles = set()
    seen_sources = set()

    for s in stories:
        angle, reasons = classify_angle_for_parent(s, parent_event, selected)

        if angle in seen_angles and s.get('sourceGroup') in seen_sources:
            continue

        selected.append({
            "angle": angle,
            "source": s.get('source'),
            "admittedBecause": reasons
        })
        seen_angles.add(angle)
        seen_sources.add(s.get('sourceGroup'))

    return selected
