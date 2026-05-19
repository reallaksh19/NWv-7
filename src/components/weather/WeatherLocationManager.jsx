import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import {
    DEFAULT_WEATHER_CITIES,
    WEATHER_LOCATION_REGISTRY,
    getConfiguredWeatherCities,
    buildWeatherSettingsWithCities,
    resolveRegistryKey,
} from '../../services/weatherLocations.js';
import './WeatherLocationManager.css';

function titleCase(str) {
    return String(str || '').replace(/\b\w/g, c => c.toUpperCase());
}

export default function WeatherLocationManager() {
    const { settings, updateSettings } = useSettings();
    const cities = getConfiguredWeatherCities(settings);
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);

    function addCity() {
        const key = inputValue.trim().toLowerCase();
        if (!key) return;
        const canonical = resolveRegistryKey(key) || key;
        if (cities.includes(canonical)) {
            setError(`${titleCase(canonical)} is already in your list.`);
            return;
        }
        if (!WEATHER_LOCATION_REGISTRY[canonical]) {
            setError(`"${inputValue.trim()}" is not in the supported city registry.`);
            return;
        }
        const next = [...cities, canonical];
        updateSettings(buildWeatherSettingsWithCities(settings, next));
        setInputValue('');
        setError('');
    }

    function removeCity(city) {
        const next = cities.filter(c => c !== city);
        if (next.length === 0) return;
        updateSettings(buildWeatherSettingsWithCities(settings, next));
    }

    function resetToDefaults() {
        updateSettings(buildWeatherSettingsWithCities(settings, [...DEFAULT_WEATHER_CITIES]));
        setError('');
    }

    if (!open) {
        return (
            <div className="wlm-collapsed">
                <button className="wlm-toggle" onClick={() => setOpen(true)}>
                    Manage weather cities ({cities.length})
                </button>
            </div>
        );
    }

    const availableToAdd = Object.keys(WEATHER_LOCATION_REGISTRY).filter(c => !cities.includes(c));

    return (
        <div className="wlm-panel">
            <div className="wlm-header">
                <span className="wlm-title">Weather Cities</span>
                <button className="wlm-toggle wlm-close" onClick={() => setOpen(false)}>Done</button>
            </div>

            <ul className="wlm-list">
                {cities.map(city => (
                    <li key={city} className="wlm-item">
                        <span className="wlm-city-name">
                            {WEATHER_LOCATION_REGISTRY[city]?.display || titleCase(city)}
                        </span>
                        <button
                            className="wlm-remove"
                            onClick={() => removeCity(city)}
                            disabled={cities.length <= 1}
                            title="Remove"
                        >
                            ✕
                        </button>
                    </li>
                ))}
            </ul>

            {availableToAdd.length > 0 && (
                <div className="wlm-add-row">
                    <select
                        className="wlm-select"
                        value={inputValue}
                        onChange={e => { setInputValue(e.target.value); setError(''); }}
                    >
                        <option value="">Add a city…</option>
                        {availableToAdd.map(c => (
                            <option key={c} value={c}>
                                {WEATHER_LOCATION_REGISTRY[c]?.display || titleCase(c)}
                            </option>
                        ))}
                    </select>
                    <button className="wlm-add-btn" onClick={addCity} disabled={!inputValue}>Add</button>
                </div>
            )}

            {error && <p className="wlm-error">{error}</p>}

            <button className="wlm-reset" onClick={resetToDefaults}>Reset to defaults</button>
        </div>
    );
}
