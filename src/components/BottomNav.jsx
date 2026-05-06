import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';

function BottomNav() {
    const { isWebView } = useMediaQuery();
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Main', icon: '🏠', group: 'primary' },
        { path: '/insight', label: 'Insight', icon: '📊', group: 'primary' },
        { path: '/up-ahead', label: 'Up Ahead', icon: '🗓️', group: 'primary' },
        { path: '/my-planner', label: 'Planner', icon: '📌', group: 'primary' },
        { path: '/markets', label: 'Market', icon: '📈', group: 'primary' },
        { path: '/weather', label: 'Weather', icon: '☁️', group: 'primary' },
        { path: '/newspaper', label: 'Newspaper', icon: '📰', group: 'desktop' },
        { path: '/tech-social', label: 'Buzz', icon: '🎭', group: 'desktop' },
        { path: '/following', label: 'Following', icon: '⭐', group: 'desktop' },
        { path: '/refresh', label: 'Refresh', icon: '🔄', group: 'desktop' },
        { path: '/settings', label: 'Settings', icon: '⚙️', group: 'primary' },
        { path: '/more', label: 'More', icon: '⋯', group: 'mobile' },
    ];

    const visibleItems = navItems.filter(item => {
        if (isWebView) return item.group !== 'mobile';
        return item.group !== 'desktop';
    });

    return (
        <nav className={`bottom-nav ${isWebView ? 'bottom-nav--desktop' : ''}`} aria-label="Primary navigation">
            {visibleItems.map((item) => {
                const isActive = item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={`bottom-nav__item ${isActive ? 'active' : ''}`}
                        title={item.label}
                    >
                        <span className="bottom-nav__icon" aria-hidden="true">{item.icon}</span>
                        <span className="bottom-nav__label">{item.label}</span>
                    </NavLink>
                );
            })}
        </nav>
    );
}

export default BottomNav;
