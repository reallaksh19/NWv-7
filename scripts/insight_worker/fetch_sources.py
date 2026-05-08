from source_registry import get_enabled_sources
import time
import uuid

def fetch_all():
    sources = get_enabled_sources()
    raw_stories = []
    health_records = []
    now = int(time.time() * 1000)

    for src in sources:
        # Mocking 2 stories per source
        raw_stories.append({
            "id": str(uuid.uuid4()),
            "title": f"Story 1 from {src}",
            "source": src,
            "publishedAt": now - 3600000
        })
        raw_stories.append({
            "id": str(uuid.uuid4()),
            "title": f"Story 2 from {src}",
            "source": src,
            "publishedAt": now - 1800000
        })
        health_records.append({
            "source": src,
            "status": "OK",
            "fetched": 2,
            "accepted": 2,
            "dropped": 0,
            "latency": 150,
            "msg": "Success",
            "reasons": {}
        })
    return raw_stories, health_records
