/**
 * Weather location registry – single source of truth for supported cities.
 * Provides lat/lon, display names, aliases, and user-configured city list.
 */

export const DEFAULT_WEATHER_CITIES = ['chennai', 'trichy', 'muscat', 'colombo'];

export const WEATHER_LOCATION_REGISTRY = {
    chennai: { lat: 13.0827, lon: 80.2707, display: 'Chennai', aliases: ['madras'] },
    trichy: { lat: 10.7905, lon: 78.7047, display: 'Trichy', aliases: ['tiruchirappalli', 'tiruchirapalli'] },
    muscat: { lat: 23.5859, lon: 58.4059, display: 'Muscat', aliases: ['maskad'] },
    colombo: { lat: 6.9271, lon: 79.8612, display: 'Colombo', aliases: ['kolamba'] },
};

/**
 * Resolve a city key to its canonical registry key (handles aliases).
 * Returns null if not found in registry.
 */
export function resolveRegistryKey(cityName) {
    const key = String(cityName || '').trim().toLowerCase().replace(/\s+/g, ' ');
    if (WEATHER_LOCATION_REGISTRY[key]) return key;
    for (const [canonical, entry] of Object.entries(WEATHER_LOCATION_REGISTRY)) {
        if (entry.aliases && entry.aliases.includes(key)) return canonical;
    }
    return null;
}

/**
 * Get the configured weather cities from settings, with migration and validation.
 * Falls back to DEFAULT_WEATHER_CITIES when settings are absent or stale.
 */
export function getConfiguredWeatherCities(settings) {
    const raw = settings?.weather?.cities;
    if (!Array.isArray(raw) || raw.length === 0) return [...DEFAULT_WEATHER_CITIES];

    // Migrate old city lists that don't include colombo
    const normalized = raw.map(c => String(c || '').trim().toLowerCase()).filter(Boolean);
    if (!normalized.includes('colombo') && normalized.length < 4) {
        if (!normalized.includes('colombo')) normalized.push('colombo');
    }
    return normalized.length > 0 ? normalized : [...DEFAULT_WEATHER_CITIES];
}

/**
 * Build a settings patch that includes the given city list.
 */
export function buildWeatherSettingsWithCities(baseSettings, cities) {
    return {
        ...baseSettings,
        weather: {
            ...(baseSettings?.weather || {}),
            cities,
        },
    };
}
