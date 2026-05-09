def build_source_health_record(source_name, status, fetched, accepted, dropped, latency, msg, reasons):
    # Map the old health dict format to the new required format if it comes from the old scraper
    if isinstance(fetched, dict) and "itemsFetched" in fetched:
        return fetched # It's already the new format or close to it

    return {
        "source": source_name,
        "url": "",
        "status": status,
        "itemsFetched": fetched,
        "itemsAccepted": accepted,
        "itemsDropped": dropped,
        "latencyMs": latency,
        "message": msg,
        "dropReasons": reasons
    }
