import React from 'react';

function getSourceLabel(source, fallbackUsed = false) {
  if (fallbackUsed) return 'fallback';

  if (!source) return 'unknown';

  const normalized = String(source).toLowerCase();

  if (normalized === 'live') return 'live';
  if (normalized === 'snapshot') return 'snapshot';
  if (normalized === 'cache') return 'cache';
  if (normalized === 'seed') return 'seed';
  if (normalized === 'failed') return 'failed';

  return normalized;
}

function getSourceTone(source, fallbackUsed = false) {
  if (fallbackUsed) return 'warning';

  const normalized = String(source || '').toLowerCase();

  if (normalized === 'live') return 'positive';
  if (normalized === 'snapshot') return 'neutral';
  if (normalized === 'cache') return 'warning';
  if (normalized === 'seed') return 'warning';
  if (normalized === 'failed') return 'danger';

  return 'neutral';
}

export default function DataSourceBadge({ source, fallbackUsed = false, labelPrefix = 'Source' }) {
  const label = getSourceLabel(source, fallbackUsed);
  const tone = getSourceTone(source, fallbackUsed);

  return (
    <span
      className={`data-state-badge data-state-badge--${tone}`}
      title={`${labelPrefix}: ${label}`}
      data-testid="data-source-badge"
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
      <span aria-hidden="true">
        {tone === 'positive' ? '●' : tone === 'danger' ? '■' : tone === 'warning' ? '▲' : '○'}
      </span>
      {label}
    </span>
  );
}

export const __dataSourceBadgeInternalsForTest = {
  getSourceLabel,
  getSourceTone,
};
