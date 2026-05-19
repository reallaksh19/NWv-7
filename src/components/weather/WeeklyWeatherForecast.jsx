import React from 'react';
import './WeeklyWeatherForecast.css';

function uvLabel(uv) {
    if (uv == null) return '';
    if (uv >= 11) return 'Extreme';
    if (uv >= 8) return 'Very High';
    if (uv >= 6) return 'High';
    if (uv >= 3) return 'Moderate';
    return 'Low';
}

export default function WeeklyWeatherForecast({ forecast, cityName }) {
    if (!Array.isArray(forecast) || forecast.length === 0) return null;
    return (
        <div className="wwf-card">
            <div className="wwf-header">
                <span className="wwf-title">7-Day Forecast</span>
                {cityName && <span className="wwf-city">{cityName}</span>}
            </div>
            <div className="wwf-rows">
                {forecast.slice(0, 7).map((day, i) => (
                    <div key={i} className={`wwf-row ${i === 0 ? 'wwf-row--today' : ''}`}>
                        <span className="wwf-day">{day.dayLabel}</span>
                        <span className="wwf-icon">{day.icon}</span>
                        <span className="wwf-condition">{day.condition}</span>
                        <span className="wwf-temps">
                            <span className="wwf-max">{day.tempMax != null ? `${day.tempMax}°` : '—'}</span>
                            <span className="wwf-sep"> / </span>
                            <span className="wwf-min">{day.tempMin != null ? `${day.tempMin}°` : '—'}</span>
                        </span>
                        <span className="wwf-rain">{day.precipProb != null ? `💧${day.precipProb}%` : ''}</span>
                        <span className="wwf-uv" title={`UV ${day.uvMax}`}>{day.uvMax != null ? `UV ${uvLabel(day.uvMax)}` : ''}</span>
                        <span className="wwf-wind">{day.windMax != null ? `💨${day.windMax}km/h` : ''}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
