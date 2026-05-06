import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';

const CORE_NAV_ITEMS = [
    { path: '/', label: 'Main', icon: '🏠' },
    { path: '/insight', label: 'Insight', icon: '📊' },
    { path: '/up-ahead', label: 'Up Ahead', icon: '🗓️' },
    { path: '/my-planner', label: 'Planner', icon: '📌' },
    { path: '/markets', label: 'Market', icon: '📈' },
    { path: '/weather', label: 'Weather', icon: '☁️' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
];

const DESKTOP_EXTRA_NAV_ITEMS = [
    { path: '/newspaper', label: 'Newspaper', icon: '📰' },
    { path: '/tech-social', label: 'Buzz', icon: '🎭' },
    { path: '/following', label: 'Following', icon: '⭐' },
    { path: '/refresh', label: 'Refresh', icon: '🔄' },
    { path: '/more', label: 'More', icon: '⋯' },
];

function BottomNav() {
    const { isWebView, layoutMode, layoutReason, layoutOverride, setLayoutModeOverride } = useMediaQuery();
    const location = useLocation();
    const navItems = isWebView
        ? [...CORE_NAV_ITEMS, ...DESKTOP_EXTRA_NAV_ITEMS]
        : CORE_NAV_ITEMS;

    const cycleLayoutMode = () => {
        if (layoutOverride === 'desktop') setLayoutModeOverride('mobile');
        else if (layoutOverride === 'mobile') setLayoutModeOverride('auto');
        else setLayoutModeOverride('desktop');
    };

    return (
        <nav
            className={`bottom-nav ${isWebView ? 'bottom-nav--desktop' : ''}`}
            data-layout-mode={layoutMode}
            data-layout-reason={layoutReason}
            aria-label={isWebView ? 'Desktop primary navigation' : 'Mobile primary navigation'}
        >
            {isWebView && (
                <div className="bottom-nav__brand" title={`Layout: ${layoutMode} (${layoutReason})`}>
                    <span className="bottom-nav__brand-mark">NW</span>
                    <span className="bottom-nav__brand-text">News Desk</span>
                </div>
            )}

            <div className="bottom-nav__items">
                {navItems.map((item) => {
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
                            <span className="bottom-nav__icon">{item.icon}</span>
                            <span className="bottom-nav__label">{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>

            {isWebView && (
                <button
                    type="button"
                    className="bottom-nav__layout-toggle"
                    onClick={cycleLayoutMode}
                    title={`Layout mode: ${layoutMode}. Click to cycle Auto/Desktop/Mobile.`}
                >
                    {layoutOverride === 'desktop' ? 'Desktop' : layoutOverride === 'mobile' ? 'Mobile' : 'Auto'}
                </button>
            )}
        </nav>
    );
}

export default BottomNav;
