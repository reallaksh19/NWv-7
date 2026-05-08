def classify_angle_for_parent(story, parent_event, selected_children):
    title = story.get('title', '').lower()
    if 'correction' in title or 'clarification' in title:
        return 'correction', ['correction signal']
    if 'official' in title or 'govt' in title or 'ministry' in title:
        return 'official_response', ['official actor']
    if 'market' in title or 'shares' in title or 'sensex' in title:
        return 'market_reaction', ['market signal']
    if 'update' in title or 'new numbers' in title:
        return 'fact_update', ['new numbers']
    if 'local' in title or 'chennai' in title or 'residents' in title:
        return 'regional_followup', ['regional specific']
    if 'exclusive' in title or 'probe' in title:
        return 'investigative_detail', ['investigative signal']
    if 'explainer' in title or 'why' in title or 'analysis' in title:
        return 'background_context', ['explainer signal']
    if 'protest' in title:
        return 'reaction_public', ['public reaction']

    # default
    if parent_event.get('canonicalHeadline') == story.get('title'):
        return 'base_report', ['headline match']

    return 'unknown', ['no specific signal']
