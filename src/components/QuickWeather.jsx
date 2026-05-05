import React, { useState, useEffect, useMemo } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useSettings } from '../context/SettingsContext';
import WeatherIcon from './WeatherIcons';

/**
 * Quick Weather Widget — Redesigned (Mobile & PC)
 * Shows configured cities side-by-side, highlighted city text forecast,
 * and a 12-hour comprehensive forecast ribbon when hourly data is available.
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

    const cities = useMemo(
        () => (settings.weather?.cities || ['chennai', 'trichy', 'muscat']).map(c => String(c).toLowerCase()),
        [settings.weather?.cities]
    );

    const visibleCities = useMemo(
        () => cities.filter(city => weatherData?.[city]?.current),
        [cities, weatherData]
    );

    const cityLabels = useMemo(() => ({
        chennai: 'Chennai',
        trichy: 'Trichy',
        muscat: 'Muscat',
        ...(cities[2] ? { [cities[2]]: cities[2].charAt(0).toUpperCase() + cities[2].slice(1) } : {})
    }), [cities]);

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

    useEffect(() => {
        if (visibleCities.length > 0 && !weatherData?.[activeCity]?.current) {
            setActiveCity(visibleCities[0]);
        }
    }, [activeCity, visibleCities, weatherData]);

    if (!booted || loading) return <div className="quick-weather-card qw-bg-day"><div style={{ textAlign: 'center', padding: '20px 0' }}>Loading weather...</div></div>;
    if (error || !weatherData || Object.values(weatherData).every(city => !city?.current)) return <div className="quick-weather-card qw-bg-night"><div style={{ textAlign: 'center', padding: '20px 0' }}>Weather unavailable</div></div>;

    const hour = new Date().getHours();
    let bgClass = 'qw-bg-day';
    if (hour >= 6 && hour < 11) bgClass = 'qw-bg-morning';
    else if (hour >= 11 && hour < 17) bgClass = 'qw-bg-day';
    else if (hour >= 17 && hour < 20) bgClass = 'qw-bg-evening';
    else bgClass = 'qw-bg-night';

    const activeCityData = weatherData[activeCity] || weatherData[visibleCities[0]];
    const activeCityName = weatherData[activeCity]?.current ? activeCity : visibleCities[0];
    const severeWarning = getSevereWarning(activeCityData);
    const textForecast = getNaturalTextForecast(activeCityData, cityLabels[activeCityName] || activeCityData?.name || 'Selected city');

    // Pick Now, +2h, +6h slots for each city
    const getCitySlots = (city) => {
        const h24 = weatherData[city]?.hourly24 || [];
        return [0, 2, 6].map(i => h24[i]).filter(Boolean);
    };

    return (
        <section className={`quick-weather-card ${bgClass}`}>
            {/* Per-city rows: name + current + Now/+2h/+6h */}
            <div className="qw-cities-list">
                {visibleCities.map(city => {
                    const d = weatherData[city];
                    const c = d.current;
                    const isActive = city === activeCityName;
                    const slots = getCitySlots(city);
                    return (
                        <div
                            key={city}
                            className={`qw-city-row ${isActive ? 'qw-city-row--active' : ''}`}
                            onClick={() => setActiveCity(city)}
                        >
                            {/* Left: city name + current */}
                            <div className="qw-city-row__left">
                                <span className="qw-city-row__name">{cityLabels[city] || d.name || city}</span>
                                <div className="qw-city-row__current">
                                    {c.iconId ? <WeatherIcon id={c.iconId} size={28} /> : <span style={{fontSize:'1.4rem'}}>{c.icon}</span>}
                                    <span className="qw-city-row__temp">{c.temp}°</span>
                                </div>
                            </div>
                            {/* Right: Now, +2h, +6h slots */}
                            <div className="qw-city-row__slots">
                                {slots.length > 0 ? slots.map((slot, i) => (
                                    <div key={i} className="qw-city-slot">
                                        <span className="qw-city-slot__label">{slot.label}</span>
                                        <div className="qw-city-slot__icon">
                                            {slot.iconId ? <WeatherIcon id={slot.iconId} size={22} /> : slot.icon}
                                        </div>
                                        <span className="qw-city-slot__temp">{slot.temp}°</span>
                                        <span className="qw-city-slot__pop">
                                            {slot.prob > 20 ? <span className="qw-pop-high">💧{slot.prob}%</span> : <span className="qw-pop-low">--</span>}
                                        </span>
                                    </div>
                                )) : (
                                    <span style={{fontSize:'0.75rem', opacity:0.5, alignSelf:'center'}}>No forecast</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* AI text forecast for active city */}
            <div className="qw-highlight-text-container">
                <span className="qw-highlight-icon">🤖</span>
                <span className="qw-highlight-text">{textForecast}</span>
            </div>

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
