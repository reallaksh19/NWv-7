def build_source_health_record(source_name, status, fetched, accepted, dropped, latency, msg, reasons):
    return {
        "source": source_name,
        "url": f"https://mock-{source_name}.com",
        "status": status,
        "itemsFetched": fetched,
        "itemsAccepted": accepted,
        "itemsDropped": dropped,
        "latencyMs": latency,
        "message": msg,
        "dropReasons": reasons
    }
