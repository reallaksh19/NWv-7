import uuid
import time

def normalize_story(raw_story):
    now = int(time.time() * 1000)
    story = raw_story.copy()
    if 'id' not in story:
        story['id'] = str(uuid.uuid4())
    story.setdefault('title', 'Unknown Title')
    story.setdefault('summary', '')
    story.setdefault('url', '')
    story.setdefault('canonicalUrl', story.get('url', ''))
    story.setdefault('source', 'Unknown')
    story.setdefault('sourceGroup', 'unknown_group')
    story.setdefault('section', 'general')
    story.setdefault('region', 'global')
    story.setdefault('tier', 'C')
    story.setdefault('publishedAt', now)
    story['fetchedAt'] = now
    story.setdefault('keywords', [])
    story.setdefault('numbers', [])
    story['canonicalText'] = story['title'] + " " + story['summary']
    story['raw'] = {'feedUrl': ''}
    story['snapshotPresence'] = {'now': True}
    story.setdefault('fetchedForSlots', ['now'])
    return story
