/**
 * embeddingsAdapter.js — Dense vector embeddings for the Insight pipeline.
 *
 * Agent A owns this file.
 *
 * Two modes:
 *   1. Gemini text-embedding-004 (requires VITE_GEMINI_API_KEY)
 *      — 768-dim, semantically meaningful, batched via batchEmbedContents()
 *   2. Content-sensitive deterministic fallback
 *      — 768-dim, character bigram/trigram frequency, unit-normalised
 *      — NOT semantically meaningful but avoids false clustering
 *      — Activated when: no API key, or EMBEDDING_TEST_FALLBACK=1
 *
 * Dimension contract: EVERY path returns exactly 768-dim unit vectors.
 * cosineSimilarity in cluster.ts assumes unit vectors (no re-normalisation there).
 *
 * Why 768 not 384:
 *   text-embedding-004 returns 768-dim vectors. The previous stub used 384.
 *   Mismatched dimensions cause cosineSimilarity to always return 0 when
 *   one path was used for seeding and another for incremental update.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Constants ─────────────────────────────────────────────────────────────────
const EMBEDDING_DIM = 768;

// Module-level cache: FNV hash → number[]
// Survives hot-reloads in Vite dev mode via module scope.
const embedCache = new Map();

// ── FNV-1a 32-bit hash (same as newsFetcher for consistency) ─────────────────
function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}

// ── Content-sensitive deterministic fallback ──────────────────────────────────
// Uses character bigram + trigram frequency bucketed into EMBEDDING_DIM slots.
// Two texts of identical length but different content produce different vectors
// because the bucket assignment depends on actual character values, not length.
//
// Unit-normalised so cosineSimilarity range is [-1, 1] as expected.
// Empty string gets a non-zero vector (hash of empty string seed) — never [0,...,0].
function deterministicVector(text) {
  const vec = new Float64Array(EMBEDDING_DIM);

  // Seed from text so empty string ≠ zero vector
  const seed = fnv1a(text || '__empty__');
  vec[parseInt(seed, 36) % EMBEDDING_DIM] += 0.1;

  const norm = text.toLowerCase();
  for (let i = 0; i < norm.length; i++) {
    const c0 = norm.charCodeAt(i);
    const c1 = i + 1 < norm.length ? norm.charCodeAt(i + 1) : 0;
    const c2 = i + 2 < norm.length ? norm.charCodeAt(i + 2) : 0;

    // Bigram bucket (weight 1.0)
    vec[(c0 * 31 + c1) % EMBEDDING_DIM] += 1.0;
    // Trigram bucket (weight 0.5) — adds longer-range structure
    vec[(c0 * 961 + c1 * 31 + c2) % EMBEDDING_DIM] += 0.5;
    // Position-weighted unigram (weight 0.3) — adds positional sensitivity
    vec[(c0 + i * 7) % EMBEDDING_DIM] += 0.3;
  }

  // Unit-normalise
  let mag = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) mag += vec[i] * vec[i];
  mag = Math.sqrt(mag) || 1;
  return Array.from(vec).map(x => x / mag);
}

// ── Resolve API key ───────────────────────────────────────────────────────────
function resolveApiKey() {
  // Vite injects import.meta.env at build time
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  // Node / test environments
  if (typeof process !== 'undefined') {
    return process.env?.GEMINI_API_KEY || process.env?.VITE_GEMINI_API_KEY || '';
  }
  return '';
}

function shouldUseFallback() {
  if (typeof process !== 'undefined' && process.env?.EMBEDDING_TEST_FALLBACK === '1') {
    return true;
  }
  const key = resolveApiKey();
  return !key || key.trim() === '';
}

/**
 * Returns 768-dim unit-normalised embeddings for each input text.
 * Output order matches input order. Output length === texts.length.
 *
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export async function getEmbeddings(texts) {
  const results = new Array(texts.length);
  const toFetch = [];  // { text, originalIndex }

  // Cache check first — avoids redundant API calls on incremental updates
  for (let i = 0; i < texts.length; i++) {
    const key = fnv1a(texts[i] ?? '');
    const hit = embedCache.get(key);
    if (hit) {
      results[i] = hit;
    } else {
      toFetch.push({ text: texts[i] ?? '', originalIndex: i });
    }
  }

  if (toFetch.length === 0) return results;

  // ── Fallback path ─────────────────────────────────────────────────────────
  if (shouldUseFallback()) {
    for (const item of toFetch) {
      const vec = deterministicVector(item.text);
      results[item.originalIndex] = vec;
      embedCache.set(fnv1a(item.text), vec);
    }
    return results;
  }

  // ── Gemini API path ───────────────────────────────────────────────────────
  try {
    const genAI = new GoogleGenerativeAI(resolveApiKey());
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

    // batchEmbedContents sends a single HTTP request for the whole batch.
    // Rate limit: 100 requests/min on free tier. Each batch = 1 request.
    const response = await model.batchEmbedContents({
      requests: toFetch.map(item => ({
        content: { role: 'user', parts: [{ text: item.text }] },
      })),
    });

    for (let i = 0; i < toFetch.length; i++) {
      const vec = response.embeddings[i]?.values;
      if (!vec || vec.length !== EMBEDDING_DIM) {
        // Corrupted API response for this item — use fallback for just this one
        console.warn(`[embeddingsAdapter] Unexpected embedding shape at index ${i}, using fallback`);
        const fallback = deterministicVector(toFetch[i].text);
        results[toFetch[i].originalIndex] = fallback;
        embedCache.set(fnv1a(toFetch[i].text), fallback);
      } else {
        results[toFetch[i].originalIndex] = vec;
        embedCache.set(fnv1a(toFetch[i].text), vec);
      }
    }
  } catch (err) {
    // Entire batch failed (network error, quota, etc.)
    // Do NOT propagate — pipeline must continue with fallback vectors.
    // The degradation is noted in console; UI shows results with lower cluster quality.
    console.error('[embeddingsAdapter] Gemini batch failed, using content-sensitive fallback:', err.message);
    for (const item of toFetch) {
      const vec = deterministicVector(item.text);
      results[item.originalIndex] = vec;
      embedCache.set(fnv1a(item.text), vec);
    }
  }

  return results;
}
