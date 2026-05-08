import os
import time
import datetime
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from io_utils import load_json, save_json
from fetch_sources import fetch_all
from normalize_story import normalize_story
from source_health import build_source_health_record
from rolling_history import age_history

def main():
    print("Starting insight snapshot build...")
    raw_stories, health_data = fetch_all()

    normalized = [normalize_story(s) for s in raw_stories]

    health_records = []
    for h in health_data:
        health_records.append(build_source_health_record(
            h["source"], h["status"], h["fetched"], h["accepted"],
            h["dropped"], h["latency"], h["msg"], h["reasons"]
        ))

    source_health_json = {
        "schemaVersion": "1.0.0",
        "generatedAt": datetime.datetime.utcnow().isoformat() + "Z",
        "sources": health_records,
        "sections": {}
    }

    history_file = "public/newsdata/insight_history.json"
    latest_file = "public/newsdata/insight_latest.json"
    health_file = "public/newsdata/insight_source_health.json"

    current_history = load_json(history_file, {"slots": {"now": [], "minus4h": [], "minus12h": [], "minus24h": []}})
    new_history = age_history(current_history, normalized)

    latest_json = {
        "generatedAt": datetime.datetime.utcnow().isoformat() + "Z",
        "stories": normalized
    }

    save_json(new_history, history_file)
    save_json(latest_json, latest_file)
    save_json(source_health_json, health_file)
    print("Snapshot build complete.")

if __name__ == "__main__":
    main()
