import React from 'react';
import {
  DataRetrySection,
  DataSkeleton,
  DataStateBanner,
  DataStateMeta,
} from './data-state/index.js';

function hasRenderableValue(value, depth = 0) {
  if (value == null) return false;
  if (depth > 3) return true;

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);

    if (entries.length === 0) return false;

    return entries.some(([key, nested]) => {
      if (['raw', 'metrics', 'diagnostics', 'validation', 'slo'].includes(key)) {
        return false;
      }

      return hasRenderableValue(nested, depth + 1);
    });
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return true;
}

function hasRenderableData(envelope) {
  return hasRenderableValue(envelope?.data);
}

function getBoundaryState({
  envelope,
  loading,
  error,
  allowDegraded,
  treatEmptyAsReady,
}) {
  if (loading && !envelope) return 'loading';
  if (error && !envelope) return 'error';
  if (!envelope) return 'empty';

  if (envelope.ok === false) {
    if (allowDegraded && hasRenderableData(envelope)) return 'degraded';
    return 'error';
  }

  if (envelope.freshness === 'empty' && !treatEmptyAsReady) {
    return 'empty';
  }

  if (!hasRenderableData(envelope) && !treatEmptyAsReady) {
    return 'empty';
  }

  if (loading && envelope) return 'refreshing';

  return 'ready';
}

export default function DataStateBoundary({
  envelope,
  loading = false,
  error = null,
  onRetry,
  children,
  label = 'Data',
  emptyTitle,
  emptyMessage,
  errorTitle,
  errorMessage,
  loadingRows = 3,
  allowDegraded = true,
  treatEmptyAsReady = false,
  showMeta = true,
  showBanner = true,
  compact = false,
}) {
  const state = getBoundaryState({
    envelope,
    loading,
    error,
    allowDegraded,
    treatEmptyAsReady,
  });

  if (state === 'loading') {
    return (
      <DataSkeleton
        rows={loadingRows}
        title={`Loading ${label}`}
        compact={compact}
      />
    );
  }

  if (state === 'error') {
    return (
      <DataRetrySection
        title={errorTitle || `${label} unavailable`}
        message={errorMessage || error || envelope?.error || `Unable to load ${label}.`}
        onRetry={onRetry}
        envelope={envelope}
        error={error}
      />
    );
  }

  if (state === 'empty') {
    return (
      <DataRetrySection
        title={emptyTitle || `${label} is empty`}
        message={emptyMessage || `No ${label.toLowerCase()} items are available right now.`}
        retryLabel="Refresh"
        onRetry={onRetry}
        envelope={envelope}
        icon="∅"
      />
    );
  }

  return (
    <section
      className={`data-state-boundary data-state-boundary--${state}`}
      data-state={state}
      data-testid="data-state-boundary"
    >
      {showBanner && (
        state === 'degraded' ||
        state === 'refreshing' ||
        envelope?.fallbackUsed ||
        envelope?.freshness === 'stale'
      ) && (
        <div style={{ marginBottom: compact ? '8px' : '12px' }}>
          <DataStateBanner
            envelope={envelope}
            error={error}
            loading={state === 'refreshing'}
            label={label}
            compact={compact}
          />
        </div>
      )}

      {showMeta && <DataStateMeta envelope={envelope} />}

      {typeof children === 'function'
        ? children({
            envelope,
            data: envelope?.data,
            state,
            loading,
            error,
            retry: onRetry,
          })
        : children}
    </section>
  );
}

export const __dataStateBoundaryInternalsForTest = {
  hasRenderableValue,
  hasRenderableData,
  getBoundaryState,
};
