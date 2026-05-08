def find_same_source(stories):
    # simplified mock
    seen = {}
    dupes = []
    kept = []
    for s in stories:
        key = s.get('sourceGroup') + s.get('title')
        if key in seen:
            dupes.append((s, seen[key], "same_source_rewrite"))
        else:
            seen[key] = s
            kept.append(s)
    return kept, dupes
