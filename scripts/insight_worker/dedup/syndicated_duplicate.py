def find_syndicated(stories):
    seen = {}
    dupes = []
    kept = []
    for s in stories:
        key = s.get('title')
        if key in seen and seen[key].get('sourceGroup') != s.get('sourceGroup'):
            dupes.append((s, seen[key], "syndicated_copy"))
        elif key not in seen:
            seen[key] = s
            kept.append(s)
        else:
            kept.append(s)
    return kept, dupes
