import React from 'react';
import './QuickWeatherSignalStrip.css';

function riskClass(level) {
    if (level === 'high') return 'qwss-chip--high';
    if (level === 'medium') return 'qwss-chip--medium';
    return 'qwss-chip--low';
}

export default function QuickWeatherSignalStrip({ riskSummary, tomorrowChip }) {
    if (!riskSummary && !tomorrowChip) return null;

    const signals = [];

    if (riskSummary) {
        if (riskSummary.rain != null) {
            const level = riskSummary.rain >= 60 ? 'high' : riskSummary.rain >= 35 ? 'medium' : 'low';
            signals.push({ key: 'rain', icon: '🌧', label: `${riskSummary.rain}%`, title: 'Rain probability', level });
        }
        if (riskSummary.heat != null) {
            const level = riskSummary.heat >= 38 ? 'high' : riskSummary.heat >= 33 ? 'medium' : 'low';
            signals.push({ key: 'heat', icon: '🌡', label: `${riskSummary.heat}°`, title: 'Max temperature', level });
        }
        if (riskSummary.uv != null) {
            const level = riskSummary.uv >= 10 ? 'high' : riskSummary.uv >= 7 ? 'medium' : 'low';
            signals.push({ key: 'uv', icon: '☀', label: `UV${riskSummary.uv}`, title: 'UV index', level });
        }
        if (riskSummary.wind != null) {
            const level = riskSummary.wind >= 40 ? 'high' : riskSummary.wind >= 25 ? 'medium' : 'low';
            signals.push({ key: 'wind', icon: '💨', label: `${riskSummary.wind}km/h`, title: 'Max wind', level });
        }
        if (riskSummary.stable) {
            signals.push({ key: 'stable', icon: '✅', label: 'Stable', title: 'No significant rain expected', level: 'low' });
        }
    }

    if (tomorrowChip) {
        signals.push({
            key: 'tomorrow',
            icon: '📅',
            label: `Tmr ${tomorrowChip.temp != null ? tomorrowChip.temp + '°' : tomorrowChip.condition}`,
            title: `Tomorrow: ${tomorrowChip.condition}`,
            level: tomorrowChip.risk,
        });
    }

    if (signals.length === 0) return null;

    return (
        <div className="qwss-strip">
            {signals.map(sig => (
                <span key={sig.key} className={`qwss-chip ${riskClass(sig.level)}`} title={sig.title}>
                    {sig.icon} {sig.label}
                </span>
            ))}
        </div>
    );
}
