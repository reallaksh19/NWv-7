import React, { useState, useEffect } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useSettings } from '../context/SettingsContext';
import WeatherIcon from './WeatherIcons';

/**
 * Quick Weather Widget — Redesigned (Mobile & PC)
 * Shows 3 cities side-by-side (squares), highlighted city text forecast,
 * and a 12-hour comprehensive forecast ribbon below.
 */
const QuickWeather = () => {
    const { weatherData, loading, error, ensureBoot, booted } = useWeather();
    const { settings } = useSettings();
    const [activeCity, setActiveCity] = useState(() => {
        try {
            return localStorage.getItem('weather_active_city') || 'chennai';
        } catch {
            return 'chennai';
        }
    });

    useEffect(() => {
        ensureBoot?.();
    }, [ensureBoot]);

    useEffect(() => {
        try {
            localStorage.setItem('weather_active_city', activeCity);
        } catch {
            // Ignore storage errors
        }
    }, [activeCity]);

    if (!booted || loading) return <div className="quick-weather-card qw-bg-day"><div style={{ textAlign: 'center', padding: '20px 0' }}>Loading weather...</div></div>;
    if (error || !weatherData || Object.values(weatherData).every(city => !city?.current)) return <div className="quick-weather-card qw-bg-night"><div style={{ textAlign: 'center', padding: '20px 0' }}>Weather unavailable</div></div>;

    const cities = (settings.weather?.cities || ['chennai', 'trichy', 'muscat']).map(c => c.toLowerCase());
    const visibleCities = cities.filter(city => weatherData?.[city]?.current);

    const cityLabels = {
        chennai: 'Chennai',
        trichy: 'Trichy',
        muscat: 'Muscat',
        [cities[2]]: cities[2].charAt(0).toUpperCase() + cities[2].slice(1)
    };

    useEffect(() => {
        if (visibleCities.length > 0 && !weatherData?.[activeCity]?.current) {
            setActiveCity(visibleCities[0]);
        }
    }, [activeCity, visibleCities, weatherData]);

    const hour = new Date().getHours();
    let bgClass = 'qw-bg-day';
    if (hour >= 6 && hour < 11) bgClass = 'qw-bg-morning';
    else if (hour >= 11 && hour < 17) bgClass = 'qw-bg-day';
    else if (hour >= 17 && hour < 20) bgClass = 'qw-bg-evening';
    else bgClass = 'qw-bg-night';

    const activeCityData = weatherData[activeCity] || weatherData[visibleCities[0]];
    const activeCityName = activeCityData ? activeCity : visibleCities[0];
    const severeWarning = getSevereWarning(activeCityData);

    const twelveHourForecast = [];
    if (activeCityData?.hourly24) {
        for (let i = 0; i < 12; i += 2) {
            if (activeCityData.hourly24[i]) {
                twelveHourForecast.push(activeCityData.hourly24[i]);
            }
        }
    }

    const textForecast = getNaturalTextForecast(activeCityData, cityLabels[activeCityName] || activeCityData?.name || 'Selected city');

    return (
        <section className={`quick-weather-card ${bgClass}`}>
            <div className="qw-cities-grid">
                {visibleCities.map(city => {
                    const d = weatherData[city];
                    const c = d.current;
                    const isActive = city === activeCityName;
                    return (
                        <div
                            key={city}
                            className={`qw-city-square ${isActive ? 'qw-city-square--active' : ''}`}
                            onClick={() => setActiveCity(city)}
                        >
                            <div className="qw-square-header">
                                <span className="qw-square-name">{cityLabels[city] || d.name || city}</span>
                            </div>
                            <div className="qw-square-icon">
                                {c.iconId ? <WeatherIcon id={c.iconId} size={40} /> : <span style={{fontSize:'2rem'}}>{c.icon}</span>}
                            </div>
                            <div className="qw-square-temp">{c.temp}°</div>
                        </div>
                    );
                })}
            </div>

            <div className="qw-highlight-text-container">
                <span className="qw-highlight-icon">🤖</span>
                <span className="qw-highlight-text">{textForecast}</span>
            </div>

            {twelveHourForecast.length > 0 && (
                <div className="qw-forecast-ribbon">
                    {twelveHourForecast.map((slot, i) => (
                        <div key={i} className="qw-ribbon-item">
                            <div className="qw-ribbon-time">{slot.label}</div>
                            <div className="qw-ribbon-icon">
                                {slot.iconId ? <WeatherIcon id={slot.iconId} size={32} /> : slot.icon}
                            </div>
                            <div className="qw-ribbon-temp">{slot.temp}°</div>
                            <div className="qw-ribbon-pop">
                                {slot.prob > 20 ? (
                                    <span className="qw-pop-high">💧{slot.prob}%</span>
                                ) : (
                                    <span className="qw-pop-low">--</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {severeWarning && (
                <div className="qw-severe-banner">
                    <span className="qw-severe-icon">⚠️</span>
                    <span className="qw-severe-text">{severeWarning}</span>
                </div>
            )}
        </section>
    );
};

function getNaturalTextForecast(cityData, cityName) {
    if (!cityData?.hourly24 || cityData.hourly24.length === 0) {
        const condition = cityData?.current?.condition;
        const temp = cityData?.current?.temp;
        if (condition && temp != null) return `${cityName}: ${condition}, ${temp}°C currently.`;
        return `Forecast for ${cityName} is unavailable right now.`;
    }

    const slots = cityData.hourly24.slice(0, 8);
    const rainSlots = slots.filter(s => s.precip > 0.5 || s.prob > 40);
    const temps = slots.map(s => s.temp).filter(t => t != null);
    const maxTemp = temps.length ? Math.max(...temps) : null;
    const minTemp = temps.length ? Math.min(...temps) : null;
    const current = cityData.current;

    if (rainSlots.length >= 3) return `Expect rainy spells throughout the next 8 hours.`;
    if (rainSlots.length > 0) return `Expecting showers around ${rainSlots[0].label}.`;

    const cloudySlots = slots.filter(s => s.condition && s.condition.toLowerCase().includes('cloud'));
    if (cloudySlots.length >= 6) return `Mostly cloudy skies for the next 8 hours.`;

    if (current && maxTemp && maxTemp > current.temp + 3) return `Clear skies, warming up to ${maxTemp}° later.`;
    if (current && minTemp && minTemp < current.temp - 3) return `Clear skies, cooling down to ${minTemp}° by evening.`;
    if (current?.condition) return `${current.condition} currently. Expect stable conditions.`;
    return `Clear skies expected for the next 8 hours.`;
}

function getSevereWarning(cityData) {
    if (!cityData?.hourly24) return null;

    const slots = cityData.hourly24;
    const heavyRainSlots = slots.filter(s => s.precip >= 10);
    const stormSlots = slots.filter(s => s.prob >= 80);
    const temps = slots.map(s => s.temp).filter(t => t != null);
    const maxTemp = temps.length > 0 ? Math.max(...temps) : null;

    if (heavyRainSlots.length > 0) return `Heavy rain warning in effect.`;
    if (stormSlots.length >= 2) return 'Thunderstorms likely.';
    if (maxTemp != null && maxTemp >= 42) return `Heat warning: temperatures reaching ${maxTemp}°C.`;
    return null;
}

export default QuickWeather;
