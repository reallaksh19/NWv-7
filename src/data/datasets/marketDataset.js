import {
  makeEnvelope,
  ENVELOPE_SOURCES,
  ENVELOPE_FRESHNESS,
} from '../dataEnvelope.js';
import { fetchAllMarketData } from '../../services/indianMarketStableService.js';
import { evaluateMarketSlo } from '../slo/marketSlo.js';

function normalizeMarketSource(sourceMode) {
  if (!sourceMode) return ENVELOPE_SOURCES.LIVE;

  if (sourceMode === 'seed') return ENVELOPE_SOURCES.SEED;
  if (sourceMode === 'cache' || sourceMode === 'stale-cache') return ENVELOPE_SOURCES.CACHE;
  if (sourceMode === 'snapshot' || sourceMode === 'stale-snapshot') return ENVELOPE_SOURCES.SNAPSHOT;

  return ENVELOPE_SOURCES.LIVE;
}

function getMarketSourceMode(data) {
  return (
    data?.sourceMode ||
    data?.providerPlan?.mode ||
    data?.sourceHealth?.mode ||
    'live'
  );
}

function getMarketTimestamp(data) {
  const numericFetchedAt = Number(data?.fetchedAt);

  if (Number.isFinite(numericFetchedAt) && numericFetchedAt > 0) {
    return numericFetchedAt;
  }

  const generatedAt = Date.parse(data?.generatedAt || data?.generated_at || '');

  if (Number.isFinite(generatedAt) && generatedAt > 0) {
    return generatedAt;
  }

  return Date.now();
}

export async function load() {
  try {
    const data = await fetchAllMarketData();
    const timestamp = getMarketTimestamp(data);
    const sourceMode = getMarketSourceMode(data);
    const slo = evaluateMarketSlo({ ...data, fetchedAt: timestamp, sourceMode });

    return makeEnvelope({
      ok: slo.passed,
      datasetId: 'market',
      data,
      source: normalizeMarketSource(sourceMode),
      freshness: slo.passed ? ENVELOPE_FRESHNESS.FRESH : ENVELOPE_FRESHNESS.EMPTY,
      generatedAt: timestamp,
      fetchedAt: Number(data?.fetchedAt || timestamp) || timestamp,
      validation: {
        passed: slo.passed,
        errors: slo.reasons || [],
        warnings: slo.warnings || [],
      },
      slo,
      diagnostics: [
        {
          event: slo.passed ? 'market_dataset_loaded' : 'market_indices_empty',
          severity: slo.passed ? 'info' : 'warn',
          message: slo.passed
            ? `${data?.indices?.length ?? 0} market index row(s) loaded`
            : 'Market indices are empty or invalid',
          details: { sourceMode },
        },
        {
          event: slo.passed ? 'market_slo_passed' : 'market_slo_failed',
          severity: slo.passed ? 'info' : 'warn',
          message: slo.passed
            ? 'Market dataset passed SLO'
            : 'Market dataset failed SLO',
          details: {
            sourceMode,
            score: slo.score,
            reasons: slo.reasons,
            warnings: slo.warnings,
          },
        },
      ],
    });
  } catch (error) {
    const message = error?.message || String(error);

    return makeEnvelope({
      ok: false,
      datasetId: 'market',
      data: null,
      source: ENVELOPE_SOURCES.FAILED,
      freshness: ENVELOPE_FRESHNESS.UNKNOWN,
      error: message,
      validation: {
        passed: false,
        errors: [message],
        warnings: [],
      },
      diagnostics: [
        {
          event: 'market_dataset_failed',
          severity: 'error',
          message,
        },
      ],
    });
  }
}
