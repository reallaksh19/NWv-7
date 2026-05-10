import React, { useState, useEffect, useMemo } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useSettings } from '../context/SettingsContext';
import WeatherIcon from './WeatherIcons';

const DEFAULT_CITIES = ['chennai', 'trichy', 'muscat'];

function titleCase(value) {
    const text = String(value || '').trim();
    if (!text) return 'Unknown';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function asNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

function segmentToSlot(segment, label) {
    if (!segment) return null;

    const temp = asNumber(segment.temp ?? segment.temperature ?? segment.currentTemp);
    const condition = segment.condition || segment.summary || segment.weather || '';
    const icon = segment.icon || '☁️';
    const iconId = segment.iconId;
    const prob = Number(segment.rainProb?.avg ?? segment.prob ?? segment.pop ?? 0) || 0;
    const rawPrecip = segment.precip ?? segment.rainMm ?? segment.rain ?? 0;
    const precip = Number.parseFloat(rawPrecip === '-' ? 0 : rawPrecip) || 0;

    if (temp == null && !condition && !iconId && !icon) return null;

    return {
        label: segment.label || segment.time || label,
        temp,
        iconId,
        icon,
        prob,
        precip,
        condition
    };
}

function currentToSlot(current) {
    if (!current) return null;
    return segmentToSlot(current, 'Current');
}

function getCitySlots(cityData) {
    if (!cityData) return [];

    const h24 = Array.isArray(cityData.hourly24) ? cityData.hourly24 : [];
    const next8 = Array.isArray(cityData.next8Hours) ? cityData.next8Hours : [];
    const source = h24.length ? h24 : next8;

    const hourlySlots = [source[0], source[2], source[6]]
        .filter(Boolean)
        .map((slot, index) => segmentToSlot(
            slot,
            slot.label || slot.time || ['Now', '+2h', '+6h'][index]
        ))
        .filter(Boolean);

    if (hourlySlots.length > 0) return hourlySlots;

    const todaySlots = [
        segmentToSlot(cityData.morning, 'Morning'),
        segmentToSlot(cityData.noon, 'Afternoon'),
        segmentToSlot(cityData.evening, 'Evening')
    ].filter(Boolean);

    if (todaySlots.length > 0) return todaySlots;

    const tomorrowSlots = [
        segmentToSlot(cityData.tomorrow?.morning, 'Tomorrow AM'),
        segmentToSlot(cityData.tomorrow?.noon, 'Tomorrow noon'),
        segmentToSlot(cityData.tomorrow?.evening, 'Tomorrow PM')
    ].filter(Boolean);

    if (tomorrowSlots.length > 0) return tomorrowSlots;

    const currentSlot = currentToSlot(cityData.current);
    return currentSlot ? [currentSlot] : [];
}

function hasUsableCityWeather(cityData) {
    return Boolean(cityData && (cityData.current || getCitySlots(cityData).length > 0));
}

function getCityLabel(city, cityData) {
    return cityData?.name || titleCase(city);
}

function getNaturalTextForecast(cityData, cityName) {
    if (!hasUsableCityWeather(cityData)) {
        return `Forecast for ${cityName} is not available yet.`;
    }

    const hourly = cityData?.hourly24?.length ? cityData.hourly24 : cityData?.next8Hours || [];

    if (!hourly || hourly.length === 0) {
        const slots = getCitySlots(cityData);
        const firstSlot = slots[0];
        const condition = cityData?.current?.condition || firstSlot?.condition;
        const temp = cityData?.current?.temp ?? firstSlot?.temp;

        if (condition && temp != null) {
            return `${cityName}: ${condition}, ${temp}°C currently.`;
        }

        return `Current weather for ${cityName} is available; forecast is updating.`;
    }

    const slots = hourly.slice(0, 8);
    const rainSlots = slots.filter(s => (s.precip || 0) > 0.5 || (s.prob || 0) > 40);
    const temps = slots.map(s => asNumber(s.temp)).filter(t => t != null);
    const maxTemp = temps.length ? Math.max(...temps) : null;
    const minTemp = temps.length ? Math.min(...temps) : null;
    const current = cityData.current;

    if (rainSlots.length >= 3) return 'Expect rainy spells throughout the next 8 hours.';
    if (rainSlots.length > 0) return `Expecting showers around ${rainSlots[0].label || rainSlots[0].time}.`;

    const cloudySlots = slots.filter(s => s.condition && s.condition.toLowerCase().includes('cloud'));
    if (cloudySlots.length >= 6) return 'Mostly cloudy skies for the next 8 hours.';

    if (current && maxTemp != null && maxTemp > current.temp + 3) {
        return `Clear skies, warming up to ${maxTemp}° later.`;
    }

    if (current && minTemp != null && minTemp < current.temp - 3) {
        return `Clear skies, cooling down to ${minTemp}° by evening.`;
    }

    if (current?.condition) return `${current.condition} currently. Expect stable conditions.`;

    return 'Weather is available. Forecast is updating.';
}

function getSevereWarning(cityData) {
    const slots = cityData?.hourly24?.length ? cityData.hourly24 : cityData?.next8Hours;
    if (!slots || slots.length === 0) return null;

    const heavyRainSlots = slots.filter(s => (s.precip || 0) >= 10);
    const stormSlots = slots.filter(s => (s.prob || 0) >= 80);
    const temps = slots.map(s => asNumber(s.temp)).filter(t => t != null);
    const maxTemp = temps.length > 0 ? Math.max(...temps) : null;

    if (heavyRainSlots.length > 0) return 'Heavy rain warning in effect.';
    if (stormSlots.length >= 2) return 'Thunderstorms likely.';
    if (maxTemp != null && maxTemp >= 42) return `Heat warning: temperatures reaching ${maxTemp}°C.`;

    return null;
}

function getBackgroundClass() {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 11) return 'qw-bg-morning';
    if (hour >= 11 && hour < 17) return 'qw-bg-day';
    if (hour >= 17 && hour < 20) return 'qw-bg-evening';

    return 'qw-bg-night';
}

const QuickWeather = () => {
    const { weatherData, loading, error, ensureBoot, booted } = useWeather();
    const { settings } = useSettings();

    const cities = useMemo(
        () => (settings?.weather?.cities || DEFAULT_CITIES)
            .map(c => String(c || '').trim().toLowerCase())
            .filter(Boolean),
        [settings?.weather?.cities]
    );

    const [activeCity, setActiveCity] = useState(() => {
        try {
            return localStorage.getItem('weather_active_city') || 'chennai';
        } catch {
            return 'chennai';
        }
    });

    const cityRows = useMemo(() => {
        return cities.map(city => {
            const cityData = weatherData?.[city] || null;
            const slots = getCitySlots(cityData);
            const currentSlot = currentToSlot(cityData?.current);
            const firstSlot = slots[0] || currentSlot;

            return {
                city,
                cityData,
                slots,
                currentSlot,
                firstSlot,
                usable: hasUsableCityWeather(cityData),
                label: getCityLabel(city, cityData)
            };
        });
    }, [cities, weatherData]);

    useEffect(() => {
        ensureBoot?.();
    }, [ensureBoot]);

    useEffect(() => {
        if (cities.length > 0 && !cities.includes(activeCity)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveCity(cities[0]);
        }
    }, [activeCity, cities]);

    useEffect(() => {
        try {
            localStorage.setItem('weather_active_city', activeCity);
        } catch {
            // Ignore storage errors.
        }
    }, [activeCity]);

    if (!booted || loading) {
        return (
            <div className="quick-weather-card qw-bg-day">
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    Loading weather...
                </div>
            </div>
        );
    }

    const usableRows = cityRows.filter(row => row.usable);

    if (!weatherData || cityRows.length === 0 || usableRows.length === 0) {
        return (
            <section className="quick-weather-card qw-bg-night">
                <div className="qw-cities-list">
                    {cityRows.map(row => (
                        <div key={row.city} className="qw-city-row qw-city-row--missing">
                            <div className="qw-city-row__left">
                                <span className="qw-city-row__name">{row.label}</span>
                                <div className="qw-city-row__current">
                                    <span className="qw-city-row__temp">--</span>
                                </div>
                            </div>

                            <div className="qw-city-row__slots">
                                <div className="qw-city-slot qw-city-slot--current-only">
                                    <span className="qw-city-slot__label">No forecast</span>
                                    <div className="qw-city-slot__icon">--</div>
                                    <span className="qw-city-slot__temp">--</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="qw-highlight-text-container">
                    <span className="qw-highlight-icon">⚠️</span>
                    <span className="qw-highlight-text">
                        {error ? 'Weather feed failed. Try refresh from Weather tab.' : 'Weather forecast is not available yet.'}
                    </span>
                </div>
            </section>
        );
    }

    const bgClass = getBackgroundClass();
    const activeRow = cityRows.find(row => row.city === activeCity && row.usable) || usableRows[0];
    const activeCityData = activeRow?.cityData;
    const severeWarning = getSevereWarning(activeCityData);
    const textForecast = getNaturalTextForecast(activeCityData, activeRow?.label || 'Selected city');

    return (
        <section className={`quick-weather-card ${bgClass}`}>
            <div className="qw-cities-list">
                {cityRows.map(row => {
                    const c = row.currentSlot || row.firstSlot;
                    const isActive = row.city === activeRow?.city;

                    return (
                        <div
                            key={row.city}
                            className={`qw-city-row ${isActive ? 'qw-city-row--active' : ''} ${!row.usable ? 'qw-city-row--missing' : ''}`}
                            onClick={() => setActiveCity(row.city)}
                        >
                            <div className="qw-city-row__left">
                                <span className="qw-city-row__name">{row.label}</span>

                                <div className="qw-city-row__current">
                                    {c?.iconId
                                        ? <WeatherIcon id={c.iconId} size={28} />
                                        : <span style={{ fontSize: '1.4rem' }}>{c?.icon || '☁️'}</span>
                                    }

                                    <span className="qw-city-row__temp">
                                        {c?.temp ?? '--'}{c?.temp != null ? '°' : ''}
                                    </span>
                                </div>
                            </div>

                            <div className="qw-city-row__slots">
                                {row.slots.length > 0 ? row.slots.slice(0, 3).map((slot, i) => (
                                    <div key={`${row.city}-${slot.label || slot.time || i}`} className="qw-city-slot">
                                        <span className="qw-city-slot__label">
                                            {slot.label || slot.time || `+${i}h`}
                                        </span>

                                        <div className="qw-city-slot__icon">
                                            {slot.iconId
                                                ? <WeatherIcon id={slot.iconId} size={22} />
                                                : slot.icon
                                            }
                                        </div>

                                        <span className="qw-city-slot__temp">
                                            {slot.temp ?? '-'}{slot.temp != null ? '°' : ''}
                                        </span>

                                        <span className="qw-city-slot__pop">
                                            {(slot.prob || 0) > 20
                                                ? <span className="qw-pop-high">💧{slot.prob}%</span>
                                                : <span className="qw-pop-low">--</span>
                                            }
                                        </span>
                                    </div>
                                )) : (
                                    <div className="qw-city-slot qw-city-slot--current-only">
                                        <span className="qw-city-slot__label">
                                            {row.usable ? 'Current' : 'No forecast'}
                                        </span>

                                        <div className="qw-city-slot__icon">
                                            {c?.iconId
                                                ? <WeatherIcon id={c.iconId} size={22} />
                                                : (c?.icon || '--')
                                            }
                                        </div>

                                        <span className="qw-city-slot__temp">
                                            {c?.temp ?? '-'}{c?.temp != null ? '°' : ''}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

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

export default QuickWeather;