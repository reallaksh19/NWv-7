import { getIdbCache, setIdbCache } from '../services/indexedDbCache.js';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetchAllMarketData } from '../services/indianMarketService';

const MarketContext = createContext(null);
/* eslint-disable react-refresh/only-export-components */

const CACHE_KEY = 'market_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

function publicDataUrl(path) {
    const base = (import.meta.env.BASE_URL || './').replace(/\/?$/, '/');
    return `${base}${String(path).replace(/^\//, '')}`;
}

function hasUsableMarketData(data) {
    return Boolean(
        data &&
        (
            (Array.isArray(data.indices) && data.indices.length > 0) ||
            (Array.isArray(data?.movers?.gainers) && data.movers.gainers.length > 0) ||
            (Array.isArray(data?.movers?.losers) && data.movers.losers.length > 0) ||
            (Array.isArray(data.commodities) && data.commodities.length > 0) ||
            (Array.isArray(data.currencies) && data.currencies.length > 0)
        )
    );
}

export function MarketProvider({ children }) {
    const [marketData, setMarketData] = useState(null);
    const [loading, setLoading] = useState(true);  // Keep true — prevents flash-of-empty (audit v3 fix)
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);
    const [booted, setBooted] = useState(false);

    const loadMarketData = useCallback(async (forceRefresh = false) => {
        if (!forceRefresh) {
            try {
                const parsed = await getIdbCache(CACHE_KEY);
                if (parsed && hasUsableMarketData(parsed)) {
                    if (Date.now() - parsed.fetchedAt < CACHE_DURATION) {
                        console.log('[MarketContext] Using cached data');
                        setMarketData(parsed);
                        setLoading(false);
                        setLastFetch(parsed.fetchedAt);
                        return;
                    }
                }
            } catch {
                console.warn('[MarketContext] Cache read failed');
            }
        }

        setLoading(true);
        setError(null);

        try {
            const data = await fetchAllMarketData();
            if (!hasUsableMarketData(data)) {
                throw new Error('Market data unavailable: live, cache, and static snapshot returned no displayable rows.');
            }
            setMarketData(data);
            setLastFetch(Date.now());
            await setIdbCache(CACHE_KEY, data);
            console.log('[MarketContext] ✅ Market data loaded');
        } catch (err) {
            console.error('[MarketContext] ❌ Failed to load market data:', err);

            try {
                const parsed = await getIdbCache(CACHE_KEY);
                if (parsed && hasUsableMarketData(parsed)) {
                    const age = Date.now() - parsed.fetchedAt;
                    console.log(`[MarketContext] Using stale cache due to fetch error (Age: ${(age/60000).toFixed(0)}m)`);
                    setMarketData(parsed);
                    setLastFetch(parsed.fetchedAt);

                    if (age > 4 * 60 * 60 * 1000) {
                        setError('Network error. Data is expired (>4h).');
                    } else {
                        setError('Network error. Showing cached data.');
                    }
                } else {
                    try {
                        const resp = await fetch(publicDataUrl('data/market_snapshot.json'), { cache: 'no-cache' });
                        if (resp.ok) {
                            const snapshot = await resp.json();
                            if (hasUsableMarketData(snapshot)) {
                                console.log('[MarketContext] Using static snapshot fallback');
                                setMarketData(snapshot);
                                const generated = snapshot.generatedAt || snapshot.generated_at;
                                setLastFetch(generated ? new Date(generated).getTime() : Date.now());
                                setError('Using offline snapshot (Live data failed)');
                                return;
                            }
                        }
                    } catch (staticErr) {
                        console.warn('Static fallback failed', staticErr);
                    }
                    setError(err.message);
                }
            } catch {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const ensureBoot = useCallback(() => {
        if (!booted) {
            setBooted(true);
            loadMarketData();
        }
    }, [booted, loadMarketData]);

    const refreshMarket = useCallback(() => {
        return loadMarketData(true);
    }, [loadMarketData]);

    return (
        <MarketContext.Provider value={{
            marketData,
            loading: booted ? loading : true,
            error,
            lastFetch,
            refreshMarket,
            ensureBoot,
            booted
        }}>
            {children}
        </MarketContext.Provider>
    );
}

export function useMarket() {
    const context = useContext(MarketContext);
    if (!context) {
        throw new Error('useMarket must be used within MarketProvider');
    }
    return context;
}
