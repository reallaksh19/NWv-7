import hashlib

def generate_event_id(story):
    key = story.get('title', '') + "".join(story.get('keywords', []))
    return hashlib.md5(key.encode()).hexdigest()
