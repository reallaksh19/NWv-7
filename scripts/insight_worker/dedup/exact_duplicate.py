from .canonical_url import normalize_url

def find_exact(stories):
    seen = {}
    dupes = []
    kept = []
    for s in stories:
        url = normalize_url(s.get('url', ''))
        if url in seen:
            dupes.append((s, seen[url], "exact_url"))
        else:
            seen[url] = s
            kept.append(s)
    return kept, dupes
