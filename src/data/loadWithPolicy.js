import { makeEnvelope, isUsableEnvelope, ENVELOPE_SOURCES, ENVELOPE_FRESHNESS } from './dataEnvelope.js';

/**
 * Generic SWR-style policy cascade.
 *
 * Each step is { id, load, validate? }.
 * Steps are evaluated in order; the first step whose load() returns a usable
 * envelope (validate returns true) is selected. Remaining steps are skipped.
 *
 * If all steps fail, a failed envelope is returned with diagnostics from all
 * attempted steps plus a loadWithPolicy.all_steps_failed event.
 *
 * @param {object} options
 * @param {string} options.datasetId
 * @param {Array<{id: string, load: () => Promise, validate?: (env) => boolean}>} options.steps
 * @param {Function} [options.mergeEnvelope] - optional post-processing of selected envelope
 * @returns {Promise<DataEnvelope>}
 */
export async function loadWithPolicy({ datasetId, steps, mergeEnvelope }) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return makeEnvelope({
      ok: false,
      datasetId,
      data: null,
      source: ENVELOPE_SOURCES.FAILED,
      freshness: ENVELOPE_FRESHNESS.UNKNOWN,
      error: 'loadWithPolicy: no steps provided',
      validation: { passed: false, errors: ['no_steps'], warnings: [] },
      diagnostics: [
        {
          event: 'loadWithPolicy.no_steps',
          severity: 'error',
          message: 'loadWithPolicy called with no steps',
        },
      ],
    });
  }

  const attemptedDiagnostics = [];

  for (const step of steps) {
    const stepId = step.id || 'unknown-step';
    const validate = step.validate || isUsableEnvelope;
    let env;

    try {
      env = await step.load();
    } catch (error) {
      const message = error?.message || String(error);

      attemptedDiagnostics.push({
        event: 'loadWithPolicy.step_threw',
        severity: 'warn',
        message: `Step ${stepId} threw: ${message}`,
        details: { stepId, error: message },
      });

      continue;
    }

    const usable = validate(env);

    if (!usable) {
      // Preserve rejected envelope diagnostics for observability
      attemptedDiagnostics.push(...(env?.diagnostics || []));
      attemptedDiagnostics.push({
        event: 'loadWithPolicy.step_rejected',
        severity: 'warn',
        message: `Step ${stepId} returned unusable envelope`,
        details: {
          stepId,
          ok: env?.ok,
          error: env?.error,
          source: env?.source,
        },
      });

      continue;
    }

    const selectedDiagnostic = {
      event: 'loadWithPolicy.step_selected',
      severity: 'info',
      message: `Step ${stepId} selected`,
      details: { stepId, source: env?.source, freshness: env?.freshness },
    };

    const allDiagnostics = [
      ...attemptedDiagnostics,
      ...(env.diagnostics || []),
      selectedDiagnostic,
    ];

    let result = makeEnvelope({
      ...env,
      datasetId,
      diagnostics: allDiagnostics,
    });

    if (typeof mergeEnvelope === 'function') {
      result = mergeEnvelope(result, step);
    }

    return result;
  }

  // All steps failed
  const failedDiagnostics = [
    ...attemptedDiagnostics,
    {
      event: 'loadWithPolicy.all_steps_failed',
      severity: 'error',
      message: `All ${steps.length} policy steps failed for ${datasetId}`,
      details: { datasetId, stepCount: steps.length },
    },
  ];

  return makeEnvelope({
    ok: false,
    datasetId,
    data: null,
    source: ENVELOPE_SOURCES.FAILED,
    freshness: ENVELOPE_FRESHNESS.UNKNOWN,
    error: `All policy steps failed for ${datasetId}`,
    validation: {
      passed: false,
      errors: [`all_policy_steps_failed:${datasetId}`],
      warnings: [],
    },
    diagnostics: failedDiagnostics,
  });
}
