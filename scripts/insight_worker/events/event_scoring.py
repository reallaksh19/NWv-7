def score_event(event):
    event['preliminaryEventScore'] = 0.5 + (0.1 * event['independentSourceCount'])
    return event
