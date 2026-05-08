import time

def age_history(current_history, latest_stories):
    now_ms = int(time.time() * 1000)
    history = current_history or {"slots": {"now": [], "minus4h": [], "minus12h": [], "minus24h": []}}

    # Age existing
    history["slots"]["minus24h"] = history["slots"]["minus12h"]
    history["slots"]["minus12h"] = history["slots"]["minus4h"]
    history["slots"]["minus4h"] = history["slots"]["now"]
    history["slots"]["now"] = latest_stories

    # Prune older than 36 hours from all slots
    cutoff = now_ms - (36 * 3600 * 1000)
    for slot in history["slots"]:
        history["slots"][slot] = [s for s in history["slots"][slot] if s.get("publishedAt", 0) > cutoff]

    return history
