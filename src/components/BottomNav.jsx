import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';

function BottomNav() {
    const { isWebView } = useMediaQuery();
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Main', icon: '\u{1F3E0}' },
        { path: '/insight', label: 'Insight', icon: '\u{1F9E0}' },
        { path: '/up-ahead', label: 'Up Ahead', icon: '\u{1F5D3}' },
        { path: '/my-planner', label: 'Planner', icon: '\u{1F4CC}' },
        { path: '/markets', label: 'Market', icon: '\u{1F4C8}' },
    ];

    return (
        <nav className={`bottom-nav ${isWebView ? 'bottom-nav--desktop' : ''}`}>
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={`bottom-nav__item ${location.pathname === item.path ? 'active' : ''}`}
                    title={item.label}
                >
                    <span className="bottom-nav__icon">{item.icon}</span>
                    <span className="bottom-nav__label">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}

export default BottomNav;
