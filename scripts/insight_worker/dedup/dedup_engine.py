from .exact_duplicate import find_exact
from .same_source_duplicate import find_same_source
from .syndicated_duplicate import find_syndicated

def run_dedup(stories):
    diagnostics = {
        "rawStoryCount": len(stories),
        "exactDuplicateCount": 0,
        "sameSourceDuplicateCount": 0,
        "syndicatedDuplicateCount": 0,
        "dropReasons": {}
    }
    records = []

    kept, dupes = find_exact(stories)
    diagnostics["exactDuplicateCount"] = len(dupes)
    for d in dupes: records.append({"storyId": d[0]['id'], "canonicalStoryId": d[1]['id'], "duplicateReason": d[2]})

    kept, dupes = find_same_source(kept)
    diagnostics["sameSourceDuplicateCount"] = len(dupes)
    for d in dupes: records.append({"storyId": d[0]['id'], "canonicalStoryId": d[1]['id'], "duplicateReason": d[2]})

    kept, dupes = find_syndicated(kept)
    diagnostics["syndicatedDuplicateCount"] = len(dupes)
    for d in dupes: records.append({"storyId": d[0]['id'], "canonicalStoryId": d[1]['id'], "duplicateReason": d[2]})

    diagnostics["dedupedStoryCount"] = len(kept)

    return {
        "stories": kept,
        "duplicateRecords": records,
        "diagnostics": diagnostics
    }
