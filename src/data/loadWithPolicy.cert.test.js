import { describe, expect, it } from 'vitest';
import { loadWithPolicy } from './loadWithPolicy.js';
import { makeEnvelope, ENVELOPE_SOURCES, ENVELOPE_FRESHNESS } from './dataEnvelope.js';

const goodEnvelope = makeEnvelope({
  ok: true,
  datasetId: 'test',
  data: { value: 42 },
  source: ENVELOPE_SOURCES.LIVE,
  freshness: ENVELOPE_FRESHNESS.FRESH,
});

const failedEnvelope = makeEnvelope({
  ok: false,
  datasetId: 'test',
  data: null,
  source: ENVELOPE_SOURCES.FAILED,
  freshness: ENVELOPE_FRESHNESS.UNKNOWN,
  error: 'step failed',
});

describe('loadWithPolicy', () => {
  it('returns failed envelope when no steps are provided', async () => {
    const env = await loadWithPolicy({ datasetId: 'test', steps: [] });
    expect(env.ok).toBe(false);
    expect(env.diagnostics.some(d => d.event === 'loadWithPolicy.no_steps')).toBe(true);
  });

  it('returns first usable step and records step_selected diagnostic', async () => {
    const steps = [
      { id: 'step1', load: async () => goodEnvelope },
    ];

    const env = await loadWithPolicy({ datasetId: 'test', steps });

    expect(env.ok).toBe(true);
    expect(env.datasetId).toBe('test');
    expect(env.data).toEqual({ value: 42 });
    expect(env.diagnostics.some(d => d.event === 'loadWithPolicy.step_selected')).toBe(true);
  });

  it('skips failed steps and selects the next usable step', async () => {
    const steps = [
      { id: 'step-fail', load: async () => failedEnvelope },
      { id: 'step-ok', load: async () => goodEnvelope },
    ];

    const env = await loadWithPolicy({ datasetId: 'test', steps });

    expect(env.ok).toBe(true);
    expect(env.diagnostics.some(d => d.event === 'loadWithPolicy.step_selected' && d.details.stepId === 'step-ok')).toBe(true);
  });

  it('preserves rejected step diagnostics in final envelope', async () => {
    const rejectedEnv = makeEnvelope({
      ok: false,
      datasetId: 'test',
      data: null,
      diagnostics: [{ event: 'prior_failure', severity: 'warn', message: 'cache miss' }],
    });

    const steps = [
      { id: 'cold-cache', load: async () => rejectedEnv },
      { id: 'live', load: async () => goodEnvelope },
    ];

    const env = await loadWithPolicy({ datasetId: 'test', steps });

    expect(env.diagnostics.some(d => d.event === 'prior_failure')).toBe(true);
  });

  it('returns all_steps_failed when every step fails', async () => {
    const steps = [
      { id: 'a', load: async () => failedEnvelope },
      { id: 'b', load: async () => failedEnvelope },
    ];

    const env = await loadWithPolicy({ datasetId: 'test', steps });

    expect(env.ok).toBe(false);
    expect(env.diagnostics.some(d => d.event === 'loadWithPolicy.all_steps_failed')).toBe(true);
    expect(env.source).toBe(ENVELOPE_SOURCES.FAILED);
  });

  it('records step_threw diagnostic when a step throws', async () => {
    const steps = [
      {
        id: 'throws',
        load: async () => {
          throw new Error('network error');
        },
      },
      { id: 'ok', load: async () => goodEnvelope },
    ];

    const env = await loadWithPolicy({ datasetId: 'test', steps });

    expect(env.ok).toBe(true);
    expect(env.diagnostics.some(d => d.event === 'loadWithPolicy.step_threw')).toBe(true);
  });

  it('respects custom validate function', async () => {
    const customEnv = makeEnvelope({
      ok: true,
      datasetId: 'test',
      data: { custom: true },
    });

    const steps = [
      {
        id: 'custom-validate',
        load: async () => customEnv,
        validate: env => env?.data?.custom === true,
      },
    ];

    const env = await loadWithPolicy({ datasetId: 'test', steps });

    expect(env.ok).toBe(true);
    expect(env.data.custom).toBe(true);
  });

  it('calls mergeEnvelope when provided', async () => {
    const steps = [
      { id: 'step1', load: async () => goodEnvelope },
    ];

    const env = await loadWithPolicy({
      datasetId: 'test',
      steps,
      mergeEnvelope: (env) => makeEnvelope({ ...env, error: 'injected' }),
    });

    expect(env.error).toBe('injected');
  });

  it('sets datasetId on the returned envelope', async () => {
    const steps = [
      { id: 'step1', load: async () => goodEnvelope },
    ];

    const env = await loadWithPolicy({ datasetId: 'overridden-id', steps });

    expect(env.datasetId).toBe('overridden-id');
  });
});
