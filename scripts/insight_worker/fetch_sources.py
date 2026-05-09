import sys
import os

# Import the existing feed parser from the old system to avoid rewriting
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import fetch_insight_stories

def fetch_all():
    # Use the existing data to seed the new pipeline instead of hardcoded mocks
    # To keep this safe and decoupled, we run the old script's fetch function
    # but map it to our new flat "all enabled sources" format

    # Actually, the requirement says we should fetch the broad universe
    # from the existing SLOTS without categorizing by time immediately.

    raw_stories = []
    health_records = []

    # Re-use the feeds defined in the old script to get real data
    all_feeds = []
    for slot, feeds in fetch_insight_stories.SLOT_FEEDS.items():
        all_feeds.extend(feeds)

    # Deduplicate feeds
    unique_feeds = []
    seen = set()
    for f in all_feeds:
        if f[0] not in seen:
            unique_feeds.append(f)
            seen.add(f[0])

    for url, src_name, src_group in unique_feeds:
        try:
            stories, health = fetch_insight_stories.fetch_feed(url, src_name, src_group)
            raw_stories.extend(stories)
            health_records.append(health)
        except Exception as e:
            health_records.append({
                "source": src_name,
                "status": "FAIL",
                "fetched": 0,
                "accepted": 0,
                "dropped": 0,
                "latency": 0,
                "msg": str(e),
                "reasons": {}
            })

    return raw_stories, health_records
