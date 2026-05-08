export async function fetchInsightDigest({ allowStale = false } = {}) {
  try {
    const res = await fetch('./newsdata/insight_digest.json', { cache: 'no-cache' });
    if (!res.ok) {
      return { ok: false, reason: 'HTTP_ERROR' };
    }

    const digest = await res.json();

    if (digest.schemaVersion !== "2.0.0") {
      return { ok: false, reason: 'SCHEMA_MISMATCH' };
    }

    if (!digest.cards || digest.cards.length === 0) {
      return { ok: false, reason: 'EMPTY_CARDS' };
    }

    const generatedAt = new Date(digest.generatedAt).getTime();
    if (isNaN(generatedAt)) {
      return { ok: false, reason: 'INVALID_DATE' };
    }

    const ageMs = Date.now() - generatedAt;
    const isStale = ageMs > 3 * 3600 * 1000;

    if (isStale && !allowStale) {
      return { ok: false, reason: 'STALE' };
    }

    if (ageMs > 48 * 3600 * 1000) {
      return { ok: false, reason: 'EXPIRED' };
    }

    let diagnostics = null;
    let sourceHealth = null;

    try {
      const diagRes = await fetch('./newsdata/insight_diagnostics.json', { cache: 'no-cache' });
      if (diagRes.ok) diagnostics = await diagRes.json();
    } catch(e) {}

    try {
      const shRes = await fetch('./newsdata/insight_source_health.json', { cache: 'no-cache' });
      if (shRes.ok) sourceHealth = await shRes.json();
    } catch(e) {}

    return {
      ok: true,
      digest,
      diagnostics,
      sourceHealth,
      stale: isStale,
      ageMs,
      sourceMode: digest.sourceMode
    };
  } catch (error) {
    return { ok: false, reason: 'FETCH_ERROR', error };
  }
}
