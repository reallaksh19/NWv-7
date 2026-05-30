import React from 'react';

function getBannerTone({ envelope, error, loading }) {
  if (loading) return 'neutral';
  if (error || envelope?.ok === false) return 'danger';
  if (envelope?.fallbackUsed) return 'warning';
  if (envelope?.freshness === 'stale') return 'warning';
  if (envelope?.freshness === 'empty') return 'muted';

  return 'positive';
}

function getBannerMessage({ envelope, error, loading, label = 'Data' }) {
  if (loading) return `${label} is loading…`;
  if (error) return `${label} failed to load.`;
  if (envelope?.ok === false) return envelope?.error || `${label} is degraded.`;
  if (envelope?.fallbackUsed) return `${label} is using fallback data.`;
  if (envelope?.freshness === 'stale') return `${label} may be stale.`;
  if (envelope?.freshness === 'empty') return `${label} has no visible items.`;

  return `${label} is ready.`;
}

export default function DataStateBanner({
  envelope,
  error,
  loading = false,
  label = 'Data',
  compact = false,
}) {
  const tone = getBannerTone({ envelope, error, loading });
  const message = getBannerMessage({ envelope, error, loading, label });

  return (
    <div
      className={`data-state-banner data-state-banner--${tone}`}
      role={tone === 'danger' ? 'alert' : 'status'}
      data-testid="data-state-banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: compact ? '8px 10px' : '10px 12px',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.22)',
        background: 'rgba(148, 163, 184, 0.08)',
        color: tone === 'danger'
          ? 'var(--accent-danger, #ff6b6b)'
          : 'var(--text-secondary, #9CA5B0)',
        fontSize: compact ? '0.78rem' : '0.84rem',
      }}
    >
      <span aria-hidden="true">
        {tone === 'danger' ? '⚠️' : tone === 'warning' ? '▲' : tone === 'positive' ? '✓' : '•'}
      </span>
      <span>{message}</span>
    </div>
  );
}

export const __dataStateBannerInternalsForTest = {
  getBannerTone,
  getBannerMessage,
};
