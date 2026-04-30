/* eslint-disable */
import React, { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import { runInsightPipeline, DEFAULT_CONFIG } from '../insight/src/index.ts';
import { slotFetcher } from '../adapters/insightFetcher.js';
import '../styles/InsightPage.css';

function ICard({ story, index, storiesById = new Map() }) {
  const [open, setOpen] = useState(false);
  const pct = Math.min(Math.round((story.finalParentScore || 0) * 100), 100);
  
  const isBreaking = story.isRising || false;
  const srcCount = story.clusterStoryIds?.length || 1;
  const timeAgo = "Live";
  const sources = [...new Set(story.clusterStoryIds.map(id => id.split('-')[0] || 'Unknown'))].slice(0, 3);

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
          <div className="iimpact"><div className="ibar"><span style={{ width: `${pct}%` }} /></div><div className="ival">{(story.finalParentScore || 0).toFixed(2)}</div></div>
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
                (story.childStoryIds?.length > 0) ? (
                    story.childStoryIds.map((childId, i) => {
                        // O(1) Map lookup — storiesById contains ALL processed articles
                        const child    = storiesById.get(childId);
                        const headline = child?.title || child?.summary || childId; // childId as last-resort fallback (not crash)
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

function InsightTab({ result }) {
  const parents = result?.parents || [];
  // Use pipeline's Map directly — do NOT rebuild. Map contains ALL stories including tier-C fallbacks.
  const storiesById = result?.storiesById instanceof Map ? result.storiesById : new Map();

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
            <circle cx="50" cy="50" r="40" fill="none" stroke="url(#rg)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${0.86 * 251.2} 251.2`} />
          </svg>
          <div className="ircenter">
            <div className="irscore">86</div>
            <div className="irslbl">Signal</div>
          </div>
        </div>
        <div className="ins-body">
          <div className="eyebrow"><span className="bip" />Live feed</div>
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
        <div className="sig" data-t="mute"><div className="snum">Live</div><div className="slb">Fresh</div></div>
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

export default function InsightPage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchInitial() {
            try {
                setLoading(true);
                const r = await runInsightPipeline(slotFetcher, DEFAULT_CONFIG);
                if (isMounted) setResult(r);
            } catch (e) {
                console.error('Failed to run insight pipeline:', e);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchInitial();
        return () => { isMounted = false; };
    }, []);

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

    if (!result?.parents?.length) {
        return (
            <div className="page-container insight-page">
                <Header title="Insight" stateLabel="Up to date" stateType="live" />
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
            <Header title="Insight" stateLabel="Live" stateType="live" />
            <div className="modern-container">
                <InsightTab result={result} />
            </div>
        </div>
    );
}
