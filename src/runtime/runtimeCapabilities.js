// src/runtime/runtimeCapabilities.js

const STATIC_HOST_PATTERNS = [
  /github\.io$/i,
  /\.netlify\.app$/i,
  /\.vercel\.app$/i,
  /\.pages\.dev$/i,
];

function isKnownStaticHost(hostname) {
  return STATIC_HOST_PATTERNS.some(pattern => pattern.test(hostname || ''));
}

function getConfiguredBackendUrl() {
  return (
    import.meta.env?.VITE_API_BASE_URL ||
    import.meta.env?.VITE_BACKEND_URL ||
    ''
  );
}

export function getRuntimeCapabilities() {
  const isBrowser = typeof window !== 'undefined';
  const hostname = isBrowser ? window.location.hostname : '';
  const isStaticHost = isKnownStaticHost(hostname);
  const configuredBackendUrl = getConfiguredBackendUrl();

  const backendConfigured = Boolean(
    configuredBackendUrl ||
    (!isStaticHost && isBrowser)
  );

  return {
    isBrowser,
    hostname,
    isStaticHost,
    backendConfigured,

    // Existing compatibility fields.
    canUseBackendApi: backendConfigured,
    preferSnapshots: isStaticHost,
    allowWideFeedFetch: !isStaticHost,

    // Release 1C compatibility + future runtime fields.
    allowRemoteSettingsSync: backendConfigured,
    canUseApi: backendConfigured,
    canUseRemoteStorage: backendConfigured,
    canUseLocalStorage: isBrowser,

    weatherMode: isStaticHost ? 'cache-or-snapshot' : 'live',
    marketMode: isStaticHost ? 'snapshot-first' : 'live',
    upAheadMode: isStaticHost ? 'limited-live' : 'full-live',
    plannerSyncMode: isStaticHost ? 'local-only' : 'remote-capable',

    featureStatus: {
      settings: isStaticHost ? 'local-only' : 'remote-capable',
      planner: isStaticHost ? 'local-only' : 'remote-capable',
      weather: isStaticHost ? 'snapshot-or-cache' : 'live',
      market: isStaticHost ? 'snapshot-or-cache' : 'live',
      upAhead: isStaticHost ? 'limited-live' : 'full-live'
    },

    runtimeLabel: isStaticHost ? 'static-host' : 'full-runtime'
  };
}
