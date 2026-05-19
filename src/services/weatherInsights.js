/**
 * Weather planning insights derived from the weekly forecast.
 * Pure functions – no side effects, no imports from React.
 */

/**
 * Build a compact tomorrow chip: summary text + risk level.
 */
export function buildTomorrowChip(cityData) {
    const tomorrow = cityData?.weeklyForecast?.[1];
    if (!tomorrow) return null;
    const rain = tomorrow.precipProb ?? 0;
    const temp = tomorrow.tempMax ?? null;
    const uv = tomorrow.uvMax ?? null;
    let risk = 'low';
    if (rain >= 60 || (temp != null && temp >= 38)) risk = 'high';
    else if (rain >= 35 || (temp != null && temp >= 33) || (uv != null && uv >= 7)) risk = 'medium';
    return { label: 'Tomorrow', temp, rain, uv, risk, condition: tomorrow.condition };
}

/**
 * Build a simple outdoor planning score (0–100) for a daily forecast entry.
 * Higher = better for outdoor activity.
 */
export function buildOutdoorScore(day) {
    if (!day) return null;
    let score = 100;
    const rain = day.precipProb ?? 0;
    const temp = day.tempMax ?? 28;
    const uv = day.uvMax ?? 5;
    const wind = day.windMax ?? 10;
    score -= Math.min(40, rain * 0.5);
    if (temp > 38) score -= 20;
    else if (temp > 35) score -= 10;
    if (uv >= 10) score -= 15;
    else if (uv >= 7) score -= 8;
    if (wind >= 40) score -= 10;
    else if (wind >= 25) score -= 5;
    return Math.max(0, Math.round(score));
}

/**
 * Summarize a city's weekly forecast into planning highlights.
 */
export function summarizeCityWeekly(cityData) {
    const forecast = cityData?.weeklyForecast;
    if (!Array.isArray(forecast) || forecast.length === 0) return null;

    const days = forecast.slice(0, 7);
    const bestDay = days.reduce((best, d) => {
        const score = buildOutdoorScore(d);
        return score > (buildOutdoorScore(best) ?? 0) ? d : best;
    }, days[0]);
    const rainiestDay = days.reduce((r, d) => ((d.precipProb ?? 0) > (r.precipProb ?? 0) ? d : r), days[0]);
    const hottestDay = days.reduce((h, d) => ((d.tempMax ?? 0) > (h.tempMax ?? 0) ? d : h), days[0]);
    const highestUvDay = days.reduce((u, d) => ((d.uvMax ?? 0) > (u.uvMax ?? 0) ? d : u), days[0]);

    return { bestDay, rainiestDay, hottestDay, highestUvDay };
}

/**
 * Build next-risk summary: rain, heat, UV, wind signals for today/tomorrow.
 */
export function buildNextRiskSummary(cityData) {
    const forecast = cityData?.weeklyForecast;
    if (!Array.isArray(forecast) || forecast.length < 2) return null;
    const today = forecast[0];
    const tomorrow = forecast[1];
    const pick = (field) => {
        const t = today?.[field] ?? null;
        const n = tomorrow?.[field] ?? null;
        return t !== null ? t : n;
    };
    return {
        rain: pick('precipProb'),
        heat: pick('tempMax'),
        uv: pick('uvMax'),
        wind: pick('windMax'),
        stable: (pick('precipProb') ?? 100) < 20,
    };
}
