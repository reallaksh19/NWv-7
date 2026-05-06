import { useState, useEffect, useSyncExternalStore } from 'react';

const DEV_MOBILE_VIEW_KEY = 'dailyEventAI_dev_mobile_view';
const DEV_MOBILE_VIEW_EVENT = 'daily-event-ai:dev-mobile-view-change';

const TABLET_MIN_WIDTH = 720;
const DESKTOP_MIN_WIDTH = 900;

function isDevMode() {
    return import.meta.env.DEV;
}

function getDevMobileViewSnapshot() {
    if (!isDevMode() || typeof window === 'undefined') return false;
    return localStorage.getItem(DEV_MOBILE_VIEW_KEY) === '1';
}

export function isDevMobileViewForced() {
    return getDevMobileViewSnapshot();
}

function subscribeDevMobileView(callback) {
    if (!isDevMode() || typeof window === 'undefined') {
        return () => {};
    }

    const handler = (event) => {
        if (event.type === 'storage' && event.key !== DEV_MOBILE_VIEW_KEY) return;
        callback();
    };

    window.addEventListener('storage', handler);
    window.addEventListener(DEV_MOBILE_VIEW_EVENT, handler);

    return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener(DEV_MOBILE_VIEW_EVENT, handler);
    };
}

export function setDevMobileViewOverride(enabled) {
    if (!isDevMode() || typeof window === 'undefined') return false;

    if (enabled) {
        localStorage.setItem(DEV_MOBILE_VIEW_KEY, '1');
    } else {
        localStorage.removeItem(DEV_MOBILE_VIEW_KEY);
    }

    window.dispatchEvent(new Event(DEV_MOBILE_VIEW_EVENT));
    return enabled;
}

export function toggleDevMobileViewOverride() {
    return setDevMobileViewOverride(!getDevMobileViewSnapshot());
}

function getViewportWidth() {
    if (typeof window === 'undefined') return 0;

    const candidates = [
        window.innerWidth,
        document?.documentElement?.clientWidth,
        window.visualViewport?.width,
    ]
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0);

    return candidates.length ? Math.max(...candidates) : 0;
}

function hasFinePointer() {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function getResponsiveState(isDevMobileView = false) {
    const width = getViewportWidth();
    const screenWidth = typeof window !== 'undefined' ? Number(window.screen?.width || 0) : 0;
    const desktopByWidth = width >= DESKTOP_MIN_WIDTH;
    const desktopByDevice = width >= TABLET_MIN_WIDTH && screenWidth >= DESKTOP_MIN_WIDTH && hasFinePointer();
    const desktop = !isDevMobileView && (desktopByWidth || desktopByDevice);
    const tablet = !isDevMobileView && !desktop && width >= TABLET_MIN_WIDTH;

    return {
        isDesktop: desktop,
        isTablet: tablet,
        isWebView: desktop,
        screenWidth: width,
        isDevMobileView,
    };
}

function applyLayoutClasses(state) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.toggle('layout-desktop', Boolean(state.isDesktop));
    root.classList.toggle('layout-tablet', Boolean(state.isTablet));
    root.classList.toggle('layout-mobile', !state.isDesktop && !state.isTablet);
    root.dataset.viewportWidth = String(Math.round(state.screenWidth || 0));
}

/**
 * Custom hook for responsive design.
 *
 * Desktop detection intentionally uses a 900px breakpoint plus fine-pointer/device-width fallback.
 * This prevents normal desktop browser windows/zoom levels from being treated as phone UI.
 */
export function useMediaQuery() {
    const isDevMobileView = useSyncExternalStore(
        subscribeDevMobileView,
        getDevMobileViewSnapshot,
        getDevMobileViewSnapshot
    );

    const [state, setState] = useState(() => getResponsiveState(isDevMobileView));

    useEffect(() => {
        const handleResize = () => {
            const next = getResponsiveState(isDevMobileView);
            setState(next);
            applyLayoutClasses(next);

            if (import.meta.env.DEV) {
                console.log(`[Layout] Width: ${Math.round(next.screenWidth)}px, Mode: ${next.isDesktop ? 'desktop' : next.isTablet ? 'tablet' : 'mobile'}`);
            }
        };

        handleResize();

        window.addEventListener('resize', handleResize);
        window.visualViewport?.addEventListener?.('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.visualViewport?.removeEventListener?.('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, [isDevMobileView]);

    return state;
}
