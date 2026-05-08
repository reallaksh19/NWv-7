def similarity(s1, s2):
    if s1.get('section') != s2.get('section'):
        return 0.0
    if s1.get('title') == s2.get('title'):
        return 1.0
    return 0.5
