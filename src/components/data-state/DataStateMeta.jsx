import React from 'react';
import DataFreshnessBadge from './DataFreshnessBadge.jsx';
import DataSourceBadge from './DataSourceBadge.jsx';
import DataSloBadge from './DataSloBadge.jsx';
import { formatTimestamp, getWarningCount } from './DataStateMeta.internals.js';

export default function DataStateMeta({
  envelope,
  showHash = false,
  showWarnings = true,
}) {
  if (!envelope) return null;

  const fetchedAtLabel = formatTimestamp(envelope.fetchedAt);
  const warningCount = getWarningCount(envelope);

  return (
    <div
      className="data-state-meta"
      data-testid="data-state-meta"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '6px',
        margin: '8px 0',
      }}
    >
      <DataFreshnessBadge freshness={envelope.freshness} />
      <DataSourceBadge source={envelope.source} fallbackUsed={envelope.fallbackUsed} />

      {envelope.slo && <DataSloBadge slo={envelope.slo} />}

      {showWarnings && warningCount > 0 && (
        <span
          className="data-state-badge data-state-badge--warning"
          title={`${warningCount} warning(s)`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            lineHeight: 1.2,
            border: '1px solid rgba(148, 163, 184, 0.24)',
            background: 'rgba(148, 163, 184, 0.10)',
            color: 'var(--text-secondary, #9CA5B0)',
          }}
        >
          â–² {warningCount} warning{warningCount === 1 ? '' : 's'}
        </span>
      )}

      {fetchedAtLabel && (
        <span
          style={{
            color: 'var(--text-muted, #768390)',
            fontSize: '0.72rem',
          }}
        >
          Updated {fetchedAtLabel}
        </span>
      )}

      {showHash && envelope.payloadHash && (
        <span
          style={{
            color: 'var(--text-muted, #768390)',
            fontSize: '0.72rem',
            fontFamily: 'monospace',
          }}
        >
          #{String(envelope.payloadHash).slice(0, 8)}
        </span>
      )}
    </div>
  );
}
