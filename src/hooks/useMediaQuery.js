import { useState, useEffect, useSyncExternalStore } from 'react';

const DEV_MOBILE_VIEW_KEY = 'dailyEventAI_dev_mobile_view';
const DEV_MOBILE_VIEW_EVENT = 'daily-event-ai:dev-mobile-view-change';
const LAYOUT_OVERRIDE_KEY = 'nwv7_layout_mode';
const LAYOUT_OVERRIDE_EVENT = 'nwv7:layout-mode-change';

function isDevMode() {
    return import.meta.env.DEV;
}

function canUseWindow() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function getDevMobileViewSnapshot() {
    if (!isDevMode() || !canUseWindow()) return false;
    return localStorage.getItem(DEV_MOBILE_VIEW_KEY) === '1';
}

export function isDevMobileViewForced() {
    return getDevMobileViewSnapshot();
}

function getLayoutOverrideSnapshot() {
    if (!canUseWindow()) return 'auto';
    const value = localStorage.getItem(LAYOUT_OVERRIDE_KEY);
    return value === 'desktop' || value === 'mobile' ? value : 'auto';
}

function subscribeDevMobileView(callback) {
    if (!isDevMode() || !canUseWindow()) {
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

function subscribeLayoutOverride(callback) {
    if (!canUseWindow()) return () => {};

    const handler = (event) => {
        if (event.type === 'storage' && event.key !== LAYOUT_OVERRIDE_KEY) return;
        callback();
    };

    window.addEventListener('storage', handler);
    window.addEventListener(LAYOUT_OVERRIDE_EVENT, handler);

    return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener(LAYOUT_OVERRIDE_EVENT, handler);
    };
}

export function setLayoutModeOverride(mode = 'auto') {
    if (!canUseWindow()) return 'auto';
    const normalized = mode === 'desktop' || mode === 'mobile' ? mode : 'auto';

    if (normalized === 'auto') {
        localStorage.removeItem(LAYOUT_OVERRIDE_KEY);
    } else {
        localStorage.setItem(LAYOUT_OVERRIDE_KEY, normalized);
    }

    window.dispatchEvent(new Event(LAYOUT_OVERRIDE_EVENT));
    return normalized;
}

export function setDevMobileViewOverride(enabled) {
    if (!isDevMode() || !canUseWindow()) return false;

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

function getViewportMetrics() {
    if (!canUseWindow()) {
        return {
            width: 0,
            height: 0,
            screenWidth: 0,
            visualWidth: 0,
            devicePixelRatio: 1,
            hasFinePointer: false,
            canHover: false,
            desktopLikeUA: false
        };
    }

    const width = Math.max(
        window.innerWidth || 0,
        document.documentElement?.clientWidth || 0,
        window.visualViewport?.width || 0
    );
    const height = Math.max(
        window.innerHeight || 0,
        document.documentElement?.clientHeight || 0,
        window.visualViewport?.height || 0
    );
    const screenWidth = Math.max(window.screen?.width || 0, window.screen?.availWidth || 0);
    const ua = window.navigator?.userAgent || '';
    const uaMobile = /Mobile|Android.*Mobile|iPhone|iPod/i.test(ua);
    const desktopLikeUA = !uaMobile;

    return {
        width,
        height,
        screenWidth,
        visualWidth: window.visualViewport?.width || width,
        devicePixelRatio: window.devicePixelRatio || 1,
        hasFinePointer: window.matchMedia?.('(pointer: fine)').matches || false,
        canHover: window.matchMedia?.('(hover: hover)').matches || false,
        desktopLikeUA
    };
}

export function resolveLayoutMode({ isDevMobileView = false, layoutOverride = 'auto' } = {}) {
    const metrics = getViewportMetrics();

    if (layoutOverride === 'desktop') {
        return { ...metrics, isDesktop: true, isTablet: false, isWebView: true, layoutMode: 'desktop', reason: 'override-desktop' };
    }

    if (layoutOverride === 'mobile' || isDevMobileView) {
        return { ...metrics, isDesktop: false, isTablet: false, isWebView: false, layoutMode: 'mobile', reason: layoutOverride === 'mobile' ? 'override-mobile' : 'dev-mobile-override' };
    }

    const widthDesktop = metrics.width >= 1024;
    const widthTablet = metrics.width >= 768 && metrics.width < 1024;

    // Browser "Desktop site" on Android tablets/phones can still report a narrower
    // CSS viewport depending on the viewport meta tag. Treat desktop-like UA or
    // mouse/trackpad capability as desktop-capable from 900px, and as tablet from 768px.
    const desktopCapable = metrics.desktopLikeUA || (metrics.hasFinePointer && metrics.canHover);
    const desktop = widthDesktop || (desktopCapable && metrics.width >= 900);
    const tablet = !desktop && (widthTablet || (desktopCapable && metrics.width >= 700));

    return {
        ...metrics,
        isDesktop: desktop,
        isTablet: tablet,
        isWebView: desktop,
        layoutMode: desktop ? 'desktop' : tablet ? 'tablet' : 'mobile',
        reason: desktop ? (widthDesktop ? 'width-desktop' : 'desktop-capable') : tablet ? 'tablet-width' : 'mobile-width'
    };
}

/**
 * Custom hook for responsive design.
 * Desktop detection is intentionally broader than `innerWidth >= 1024` so
 * Chrome/Android "Desktop site", tablets with keyboards, and narrow desktop
 * windows do not get trapped in the mobile shell.
 */
export function useMediaQuery() {
    const initial = resolveLayoutMode();
    const [layoutState, setLayoutState] = useState(initial);
    const isDevMobileView = useSyncExternalStore(
        subscribeDevMobileView,
        getDevMobileViewSnapshot,
        getDevMobileViewSnapshot
    );
    const layoutOverride = useSyncExternalStore(
        subscribeLayoutOverride,
        getLayoutOverrideSnapshot,
        getLayoutOverrideSnapshot
    );

    useEffect(() => {
        const handleResize = () => {
            const next = resolveLayoutMode({ isDevMobileView, layoutOverride });
            setLayoutState(next);

            if (canUseWindow()) {
                document.documentElement.dataset.layoutMode = next.layoutMode;
                document.documentElement.dataset.layoutReason = next.reason;
            }

            console.log(`[Layout] Width: ${next.width}px, Mode: ${next.layoutMode}, Reason: ${next.reason}`);
        };

        handleResize();

        window.addEventListener('resize', handleResize);
        window.visualViewport?.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.visualViewport?.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, [isDevMobileView, layoutOverride]);

    return {
        isDesktop: layoutState.isDesktop,
        isTablet: layoutState.isTablet,
        isWebView: layoutState.isWebView,
        screenWidth: layoutState.width,
        isDevMobileView,
        layoutMode: layoutState.layoutMode,
        layoutReason: layoutState.reason,
        layoutOverride,
        setLayoutModeOverride
    };
}
