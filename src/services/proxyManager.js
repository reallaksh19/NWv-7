/**
 * Proxy Manager - Handles failover between multiple RSS proxies
 * Hardened for static hosting: cooldowns, in-memory caching, and dead-proxy suppression
 */
import logStore from '../utils/logStore.js';

function parseXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('XML Parsing Error');
    }

    const feedTitle = xmlDoc.querySelector('channel > title')?.textContent || 'Unknown Source';

    const items = Array.from(xmlDoc.querySelectorAll('item')).map(node => {
        const title = node.querySelector('title')?.textContent;
        const link = node.querySelector('link')?.textContent;
        const pubDate = node.querySelector('pubDate')?.textContent;
        const description = node.querySelector('description')?.textContent;
        const guid = node.querySelector('guid')?.textContent;
        const author = node.querySelector('author')?.textContent || node.querySelector('dc\\:creator')?.textContent;
        const enclosureNode = node.querySelector('enclosure');
        const enclosure = enclosureNode ? {
            url: enclosureNode.getAttribute('url'),
            type: enclosureNode.getAttribute('type')
        } : null;
        const mediaContentNode = node.querySelector('media\\:content') || node.querySelector('content');
        const mediaContent = mediaContentNode ? { url: mediaContentNode.getAttribute('url') } : null;
        const mediaThumbnailNode = node.querySelector('media\\:thumbnail') || node.querySelector('thumbnail');
        const thumbnail = mediaThumbnailNode ? mediaThumbnailNode.getAttribute('url') : null;

        return {
            title,
            link,
            pubDate,
            description,
            guid,
            author,
            enclosure,
            'media:content': mediaContent,
            thumbnail
        };
    });

    return { title: feedTitle, items };
}

const PROXIES = [
    {
        name: 'allorigins',
        format: (feedUrl, raw = false) =>
            raw
                ? `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`
                : `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`,
        parse: async (response, raw = false) => {
            if (raw) {
                const text = await response.text();
                if (!text) throw new Error('Empty response from allorigins');
                return parseXML(text);
            }
            const data = await response.json();
            if (!data?.contents) throw new Error('allorigins: no contents');
            return parseXML(data.contents);
        }
    },
    {
        name: 'corsproxy',
        format: (feedUrl) => `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`,
        parse: async (response) => {
            const text = await response.text();
            if (!text) throw new Error('Empty response from corsproxy');
            return parseXML(text);
        }
    },
    {
        name: 'codetabs',
        format: (feedUrl) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feedUrl)}`,
        parse: async (response) => {
            const text = await response.text();
            if (!text) throw new Error('Empty response from codetabs');
            return parseXML(text);
        }
    },
    {
        name: 'crossorigin',
        format: (feedUrl) => `https://crossorigin.me/${feedUrl}`,
        parse: async (response) => {
            const text = await response.text();
            if (!text) throw new Error('Empty response from crossorigin');
            return parseXML(text);
        }
    },
    {
        name: 'rss2json',
        format: (feedUrl) => `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`,
        parse: async (response) => {
            const data = await response.json();
            if (data.status === 'ok') {
                return { title: data.feed?.title, items: data.items || [] };
            }
            throw new Error('rss2json status not ok');
        }
    }
];

const SUCCESS_CACHE_TTL_MS = 10 * 60 * 1000;
const SHORT_COOLDOWN_MS = 5 * 60 * 1000;
const LONG_COOLDOWN_MS = 60 * 60 * 1000;

function now() {
    return Date.now();
}

function isLikelyCorsError(message = '') {
    const lower = String(message || '').toLowerCase();
    return lower.includes('cors') || lower.includes('failed to fetch') || lower.includes('networkerror');
}

function isRateLimitError(message = '') {
    return String(message || '').includes('429');
}

class ProxyManager {
    constructor() {
        this.currentIndex = 0;
        this.failureCounts = new Map();
        this.lastSuccess = new Map();
        this.cooldownUntil = new Map();
        this.responseCache = new Map();
    }

    getCached(feedUrl) {
        const cached = this.responseCache.get(feedUrl);
        if (!cached) return null;
        if ((now() - cached.timestamp) > SUCCESS_CACHE_TTL_MS) {
            this.responseCache.delete(feedUrl);
            return null;
        }
        return cached.result;
    }

    setCached(feedUrl, result) {
        this.responseCache.set(feedUrl, { result, timestamp: now() });
    }

    isProxyCoolingDown(proxyName) {
        const until = this.cooldownUntil.get(proxyName) || 0;
        return until > now();
    }

    setCooldown(proxyName, errorMessage) {
        const duration = isRateLimitError(errorMessage)
            ? SHORT_COOLDOWN_MS
            : (isLikelyCorsError(errorMessage) ? LONG_COOLDOWN_MS : SHORT_COOLDOWN_MS);
        this.cooldownUntil.set(proxyName, now() + duration);
    }

    async fetchViaProxy(feedUrl) {
        const cached = this.getCached(feedUrl);
        if (cached) {
            return cached;
        }

        const availableProxies = PROXIES.filter(proxy => !this.isProxyCoolingDown(proxy.name));
        const proxiesToTry = availableProxies.length > 0 ? availableProxies : PROXIES;
        let lastError = null;

        for (let i = 0; i < proxiesToTry.length; i++) {
            const index = (this.currentIndex + i) % proxiesToTry.length;
            const proxy = proxiesToTry[index];

            try {
                const proxyUrl = proxy.format(feedUrl);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);

                let response;
                try {
                    response = await fetch(proxyUrl, {
                        signal: controller.signal,
                        cache: 'no-store'
                    });
                } finally {
                    clearTimeout(timeoutId);
                }

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const result = await proxy.parse(response);
                if (!result || !Array.isArray(result.items) || result.items.length === 0) {
                    throw new Error('No items returned');
                }

                this.failureCounts.set(proxy.name, 0);
                this.lastSuccess.set(proxy.name, now());
                this.cooldownUntil.delete(proxy.name);
                this.currentIndex = index;
                this.setCached(feedUrl, result);
                logStore.info('proxy', `${proxy.name} OK (${result.items.length} items)`);
                return result;
            } catch (error) {
                const message = error?.message || 'unknown';
                lastError = error;
                this.failureCounts.set(proxy.name, (this.failureCounts.get(proxy.name) || 0) + 1);
                this.setCooldown(proxy.name, message);
                console.warn(`[ProxyManager] ${proxy.name} failed for ${feedUrl}:`, message);
            }
        }

        if (cached) {
            return cached;
        }

        logStore.error('proxy', `All proxies failed: ${lastError?.message}`);
        throw new Error(`All proxies failed. Last error: ${lastError?.message || 'unknown'}`);
    }

    getProxyHealth() {
        return PROXIES.map(proxy => ({
            name: proxy.name,
            failures: this.failureCounts.get(proxy.name) || 0,
            lastSuccess: this.lastSuccess.get(proxy.name) || null,
            coolingDown: this.isProxyCoolingDown(proxy.name)
        }));
    }

    /**
     * Fetch a JSON endpoint (e.g. Yahoo Finance) via CORS proxy with Circuit Breaker + EMA.
     * Unlike fetchViaProxy, this returns the raw parsed JSON (not an RSS object).
     * @param {string} url  The target JSON URL (will be proxy-wrapped)
     * @returns {Promise<Object>} Parsed JSON response
     */
    async fetchJsonViaProxy(url) {
        // EMA-sorted proxy indices, circuit-open proxies excluded
        const indices = PROXIES
            .map((_, i) => i)
            .filter(i => {
                const until = this.cooldownUntil.get(PROXIES[i].name) || 0;
                return until <= Date.now();
            })
            .sort((a, b) => {
                const emaA = this._ema?.get(PROXIES[a].name) || 500;
                const emaB = this._ema?.get(PROXIES[b].name) || 500;
                return emaA - emaB;
            });

        if (!this._ema) this._ema = new Map();
        if (indices.length === 0) throw new Error('All proxies circuit-open');

        const MAX_RETRIES = 2;

        for (const i of indices) {
            const proxy = PROXIES[i];
            const proxyUrl = proxy.format(url, /* raw= */ true);

            for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
                const t0 = Date.now();
                const controller = new AbortController();
                const tid = setTimeout(() => controller.abort(), 8000);
                try {
                    const res = await fetch(proxyUrl, {
                        signal: controller.signal,
                        cache: 'no-store'
                    });
                    clearTimeout(tid);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const text = await res.text();
                    const json = JSON.parse(text);
                    // Record EMA latency on success
                    const latency = Date.now() - t0;
                    const alpha = 0.3;
                    const prev = this._ema.get(proxy.name) || 500;
                    this._ema.set(proxy.name, alpha * latency + (1 - alpha) * prev);
                    this.failureCounts.set(proxy.name, 0);
                    this.cooldownUntil.delete(proxy.name);
                    return json;
                } catch (err) {
                    clearTimeout(tid);
                    const isTransient = /429|503|rate/i.test(err.message || '');
                    if (isTransient && attempt < MAX_RETRIES) {
                        // Exponential backoff: 500ms → 1000ms → 2000ms
                        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
                        continue;
                    }
                    // Increment failure, set cooldown
                    const failures = (this.failureCounts.get(proxy.name) || 0) + 1;
                    this.failureCounts.set(proxy.name, failures);
                    if (failures >= 3) {
                        this.cooldownUntil.set(proxy.name, Date.now() + 5 * 60_000);
                    }
                    break; // try next proxy
                }
            }
        }
        throw new Error('fetchJsonViaProxy: all proxies failed');
    }
}

export const proxyManager = new ProxyManager();
