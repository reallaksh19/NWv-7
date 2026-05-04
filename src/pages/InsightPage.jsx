/* eslint-disable */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Header from '../components/Header.jsx';
import { runInsightPipeline, DEFAULT_CONFIG } from '../insight/src/index.ts';
import { createInsightFetcher } from '../adapters/insightFetcher.js';
import '../styles/InsightPage.css';

// ── Cache config ──────────────────────────────────────────────────────────────
const CACHE_KEY      = 'insight_pipeline_cache';
const CACHE_MAX_AGE  = 3 * 3_600_000;   // 3 h — aligned to snapshot freshness
const REFRESH_EVERY  = 5 * 60_000;      // background poll interval (5 min)
const HIDDEN_REFRESH = 5 * 60_000;      // re-run if tab was hidden for >5 min

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_MAX_AGE) return null;
    // Re-inflate the Map (JSON.stringify flattens it)
    if (data && !(data.storiesById instanceof Map)) {
      data.storiesById = new Map(Object.entries(data.storiesById || {}));
    }
    return { ts, data };
  } catch { return null; }
}

function writeCache(data) {
  try {
    // Map cannot be JSON-serialised — convert to plain object
    const serialisable = {
      ...data,
      storiesById: data.storiesById instanceof Map
        ? Object.fromEntries(data.storiesById)
        : (data.storiesById || {}),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: serialisable }));
  } catch { /* quota errors are non-fatal */ }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ICard({ story, index, storiesById = new Map() }) {
  const [open, setOpen] = useState(false);
  const pct = Math.min(Math.round((story.finalParentScore || 0) * 100), 100);

  const isBreaking = story.isRising || false;
  const srcCount   = story.clusterStoryIds?.length || 1;
  const timeAgo    = 'Live';
  const sources    = [...new Set(story.clusterStoryIds.map(id => id.split('-')[0] || 'Unknown'))].slice(0, 3);

  return (
    <div className={`icard ${open ? 'open' : ''}`} data-top="true">
      <div className="icard-top" onClick={() => setOpen(o => !o)}>
        <div className="irank">{String(index + 1).padStart(2, '0')}</div>
        <div className="ibody">
          <div className="imeta-row">
            <span className="isource">Cluster</span><span className="idot" />
            <span className="itime">{timeAgo}</span>
            {isBreaking && <span className="itag breaking">🔥 Rising</span>}
            {srcCount > 1 && <span className="itag multi">{srcCount} stories</span>}
            {story.weakTree && <span className="itag" style={{ background: '#78350f', color: '#fde68a' }}>⚠ Thin</span>}
          </div>
          <h3>{story.canonicalHeadline}</h3>
          <div className="iimpact">
            <div className="ibar"><span style={{ width: `${pct}%` }} /></div>
            <div className="ival">{(story.finalParentScore || 0).toFixed(2)}</div>
          </div>
          <div className="isrcs">{sources.map((s, i) => <span key={i} className="s">{s}</span>)}</div>
        </div>
        <button className="expand-btn" tabIndex={-1}>{open ? '−' : '+'}</button>
      </div>
      {open && (
        <div className="iexpand"><div className="iexpand-inner">
          <div className="exp-block">
            <div className="exp-label"><span className="dot" />Summary</div>
            <p className="exp-summary">{story.canonicalSummary}</p>
          </div>
          <div className="exp-block">
            <div className="exp-label"><span className="dot" style={{ background: 'var(--warn, #F0883E)' }} />Child Stories</div>
            <div className="src-list">
              {Array.isArray(story.childStoryIds) && (
                story.childStoryIds.length > 0 ? (
                  story.childStoryIds.map((childId, i) => {
                    const child    = storiesById.get(childId);
                    const headline = child?.title || child?.summary || childId;
                    const source   = child?.source || child?.sourceGroup || 'Unknown';
                    const url      = child?.url || null;
                    return (
                      <div key={childId} className="src-item">
                        <span className="sname" title={source}>{source}</span>
                        {url
                          ? <a className="sdesc" href={url} target="_blank" rel="noopener noreferrer"
                               onClick={e => e.stopPropagation()}>{headline}</a>
                          : <span className="sdesc">{headline}</span>
                        }
                        <span className="ang diff">Angle {i + 1}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="src-item" style={{ opacity: 0.5, fontStyle: 'italic' }}>
                    <span className="sdesc">No additional angles found for this story</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div></div>
      )}
    </div>
  );
}

function InsightTab({ result, source }) {
  const parents     = result?.parents || [];
  const storiesById = result?.storiesById instanceof Map ? result.storiesById : new Map();
  const sourceLabel = source === 'stale-snapshot' ? 'Cached' : source === 'snapshot' ? 'Live' : 'Live';

  return (
    <div className="scroll insight-page">
      <div className="ins-pulse">
        <div className="ins-ring">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#00D4AA" /><stop offset="1" stopColor="#58A6FF" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="url(#rg)" strokeWidth="9"
              strokeLinecap="round" strokeDasharray={`${0.86 * 251.2} 251.2`} />
          </svg>
          <div className="ircenter">
            <div className="irscore">86</div>
            <div className="irslbl">Signal</div>
          </div>
        </div>
        <div className="ins-body">
          <div className="eyebrow"><span className="bip" />{sourceLabel} feed</div>
          <p>Day leans <em>positive</em> — <em>{parents.filter(p => p.isRising).length} breaking</em> threads active</p>
          <div className="ins-meta">
            <span>Just updated</span><span>·</span>
            <span><b>{parents.length}</b> clusters</span><span>·</span>
            <span>next in <b>05:00</b></span>
          </div>
        </div>
      </div>
      <div className="sstrip">
        <div className="sig" data-t="info"><div className="snum">{parents.length}</div><div className="slb">Ranked</div></div>
        <div className="sig" data-t="warn"><div className="snum">{parents.filter(p => p.isRising).length}</div><div className="slb">Rising</div></div>
        <div className="sig" data-t="good"><div className="snum">{parents.reduce((acc, p) => acc + p.clusterStoryIds.length, 0)}</div><div className="slb">Stories</div></div>
        <div className="sig" data-t="teal"><div className="snum">9<span style={{ color: 'var(--muted)', fontSize: '.75rem' }}>/9</span></div><div className="slb">Sections</div></div>
        <div className="sig" data-t="mute"><div className="snum">{sourceLabel}</div><div className="slb">Fresh</div></div>
      </div>
      <div className="isec">
        <h3><span className="glyph">▲</span>Top Ranked</h3>
        <span className="imeta"><b>{parents.length}</b> shown · tap + to expand</span>
      </div>
      {parents.map((p, i) => (
        <ICard key={p.parentId} story={p} index={i} storiesById={storiesById} />
      ))}
    </div>
  );
}

function EmptyState({ icon, title, message }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted, #9CA5B0)' }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ margin: '0 0 8px 0', color: 'var(--txt, #FFFFFF)' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '14px' }}>{message}</p>
    </div>
  );
}

function FreshBanner({ onAccept, onDismiss }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--accent, #00D4AA)', color: '#000',
      padding: '10px 16px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', fontSize: '13px', fontWeight: 600,
    }}>
      <span>🔄 New clusters available · Refresh now</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onAccept}
          style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 4,
                   padding: '4px 12px', cursor: 'pointer', fontSize: '12px' }}>
          Update
        </button>
        <button onClick={onDismiss}
          style={{ background: 'transparent', color: '#000', border: '1px solid #000',
                   borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function InsightPage() {
  const [result, setResult]           = useState(null);
  const [pendingResult, setPending]   = useState(null);   // background refresh result
  const [loading, setLoading]         = useState(true);
  const [source, setSource]           = useState('live');
  const fetcherRef                    = useRef(null);
  const hiddenAtRef                   = useRef(null);
  const isMounted                     = useRef(true);

  // ── Core pipeline run ───────────────────────────────────────────────────────
  const runPipeline = useCallback(async (background = false) => {
    try {
      if (!background && !result) setLoading(true);

      // Build fetcher once per page load (re-use on subsequent calls)
      if (!fetcherRef.current) {
        fetcherRef.current = await createInsightFetcher();
      }
      const { fetcher, source: src, pipelineConfigOverrides } = fetcherRef.current;

      const config = pipelineConfigOverrides
        ? { ...DEFAULT_CONFIG, ...pipelineConfigOverrides }
        : DEFAULT_CONFIG;
      const r = await runInsightPipeline(fetcher, config);
      if (!isMounted.current) return;

      if (background && result?.parents?.length) {
        // Surface new clusters only if count changed materially
        const currentCount = result.parents?.length ?? 0;
        const newCount     = r?.parents?.length ?? 0;
        if (newCount > 0 && newCount !== currentCount) {
          setPending({ result: r, source: src });
        } else {
          // Silent update (no visible change to user)
          setResult(r);
          setSource(src);
          writeCache(r);
        }
      } else {
        setResult(r);
        setSource(src);
        writeCache(r);
      }
    } catch (e) {
      console.error('[InsightPage] Pipeline failed:', e);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [result]);

  // ── Mount: restore cache → background refresh ───────────────────────────────
  useEffect(() => {
    isMounted.current = true;

    const cached = readCache();
    if (cached?.data?.parents?.length) {
      setResult(cached.data);
      setSource('cached');
      setLoading(false);
      // Re-run in background to get fresher data
      runPipeline(true);
    } else {
      // No cache — full foreground run
      runPipeline(false);
    }

    return () => { isMounted.current = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Periodic background refresh ─────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      if (isMounted.current) runPipeline(true);
    }, REFRESH_EVERY);
    return () => clearInterval(timer);
  }, [runPipeline]);

  // ── visibilitychange: refresh if tab was hidden > 5 min ─────────────────────
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
      } else {
        const hiddenMs = hiddenAtRef.current ? Date.now() - hiddenAtRef.current : 0;
        if (hiddenMs > HIDDEN_REFRESH) {
          fetcherRef.current = null; // force re-init to catch new snapshot
          runPipeline(true);
        }
        hiddenAtRef.current = null;
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [runPipeline]);

  // ── Pending-result handlers ──────────────────────────────────────────────────
  const acceptPending = useCallback(() => {
    if (pendingResult) {
      setResult(pendingResult.result);
      setSource(pendingResult.source);
      writeCache(pendingResult.result);
    }
    setPending(null);
  }, [pendingResult]);

  const dismissPending = useCallback(() => setPending(null), []);

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-container insight-page">
        <Header title="Insight" stateLabel="Loading" stateType="loading" />
        <div className="modern-container">
          <p style={{ textAlign: 'center', marginTop: '20px' }}>Running AI pipeline…</p>
        </div>
      </div>
    );
  }

  const staleLabel = source === 'stale-snapshot' && fetcherRef.current?.snapshotTs
    ? `Cached · ${Math.round((Date.now() - Number(fetcherRef.current.snapshotTs)) / 3_600_000)}h old`
    : null;

  if (!result?.parents?.length) {
    return (
      <div className="page-container insight-page">
        <Header title="Insight" stateLabel={staleLabel || 'Up to date'} stateType={staleLabel ? 'stale' : 'live'} />
        <div className="modern-container">
          <EmptyState
            icon="🧠"
            title="No Insights Available"
            message="Couldn't generate clusters from the latest news right now."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Header title="Insight" stateLabel={staleLabel || 'Live'} stateType={staleLabel ? 'stale' : 'live'} />
      {pendingResult && (
        <FreshBanner onAccept={acceptPending} onDismiss={dismissPending} />
      )}
      <div className="modern-container">
        <InsightTab result={result} source={source} />
      </div>
    </div>
  );
}
