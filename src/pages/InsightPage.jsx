/* eslint-disable */
/**
 * InsightPage.jsx — Insight tab: ranked story clusters with live refresh.
 *
 * Agent B owns this file.
 *
 * Architecture:
 *   - Full InsightRunResult stored in state (not just parents[])
 *     so storiesById Map is accessible to all child components.
 *   - 5-minute interval calls applyIncrementalUpdate for live badge refresh.
 *   - ParentCard receives storiesById and looks up each child by ID.
 *   - All imports from insightFetcher.js — never directly from insight/src/index.ts.
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  runInsightPipeline,
  applyIncrementalUpdate,
  DEFAULT_CONFIG,
  slotFetcher,
} from '../adapters/insightFetcher.js';
import Header from '../components/Header.jsx';
import EmptyState from '../components/EmptyState.jsx';
import '../styles/InsightPage.css';

// ── Angle display config ──────────────────────────────────────────────────────
const ANGLE_META = {
  base_report:          { label: 'BASE',      bg: '#1a3a5c', color: '#60a5fa' },
  official_response:    { label: 'OFFICIAL',  bg: '#1a3d2b', color: '#4ade80' },
  fact_update:          { label: 'FACT',      bg: '#3d2e0a', color: '#fbbf24' },
  market_reaction:      { label: 'MARKET',    bg: '#2d1f47', color: '#c084fc' },
  expert_analysis:      { label: 'EXPERT',    bg: '#3d1e1a', color: '#f87171' },
  regional_followup:    { label: 'REGIONAL',  bg: '#1e2d3d', color: '#94a3b8' },
  investigative_detail: { label: 'INVEST.',   bg: '#2d2a0a', color: '#facc15' },
  correction:           { label: 'CORRECTION',bg: '#3d1a1a', color: '#fb923c' },
  background_context:   { label: 'CONTEXT',   bg: '#1a2a2d', color: '#67e8f9' },
  reaction_public:      { label: 'PUBLIC',    bg: '#2a1a3d', color: '#a78bfa' },
  unknown:              { label: 'OTHER',     bg: '#2a2a2a', color: '#9ca3af' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(epochMs) {
  if (!epochMs) return 'Unknown';
  const diffMin = Math.round((Date.now() - epochMs) / 60_000);
  if (diffMin < 1)  return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24)   return `${diffH}h ago`;
  return `${Math.round(diffH / 24)}d ago`;
}

function computeSignalScore(parents) {
  if (!parents.length) return 0;
  const avg = parents.reduce((s, p) => s + (p.finalParentScore || 0), 0) / parents.length;
  return Math.min(99, Math.round(avg * 100));
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AngleBadge({ angle }) {
  const m = ANGLE_META[angle] || ANGLE_META.unknown;
  return (
    <span style={{
      background: m.bg, color: m.color,
      padding: '2px 6px', borderRadius: '3px',
      fontSize: '10px', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.5px',
      flexShrink: 0, alignSelf: 'flex-start',
    }}>
      {m.label}
    </span>
  );
}

function SnapshotDots({ snapshotPresence }) {
  const SLOTS = [
    { key: 'now',      label: 'Now' },
    { key: 'minus4h',  label: '−4h' },
    { key: 'minus12h', label: '−12h' },
    { key: 'minus24h', label: '−24h' },
  ];
  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
      {SLOTS.map(({ key, label }) => (
        <span key={key} title={label} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: snapshotPresence?.[key]
            ? 'var(--teal, #00D4AA)'
            : 'rgba(255,255,255,0.12)',
          display: 'inline-block',
          boxShadow: snapshotPresence?.[key] ? '0 0 4px rgba(0,212,170,0.6)' : 'none',
        }} />
      ))}
    </div>
  );
}

/**
 * Renders one child story.
 * Receives the story ID and resolves it via storiesById.
 * Returns null (renders nothing) if the story is not found in the map —
 * this can happen during incremental updates before the map is refreshed.
 */
function ChildStory({ childId, storiesById }) {
  const story = storiesById?.get(childId);
  if (!story) return null;

  return (
    <li style={{
      padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', gap: '10px', alignItems: 'flex-start',
      listStyle: 'none',
    }}>
      <AngleBadge angle={story.angle || 'unknown'} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            fontSize: 13, fontWeight: 600,
            color: 'var(--txt, #FFFFFF)',
            textDecoration: 'none',
            marginBottom: 4,
            lineHeight: '1.35',
          }}
        >
          {story.title}
        </a>
        {story.summary && story.summary !== 'No summary available.' && (
          <p style={{
            margin: '0 0 4px 0',
            fontSize: 12,
            color: 'var(--muted, #9CA5B0)',
            lineHeight: '1.5',
          }}>
            {story.summary.length > 180
              ? story.summary.slice(0, 180) + '…'
              : story.summary}
          </p>
        )}
        <div style={{ fontSize: 11, color: 'rgba(156,165,176,0.7)' }}>
          {story.source}
          {story.sourceTier && (
            <span style={{ marginLeft: 6, opacity: 0.5 }}>Tier {story.sourceTier}</span>
          )}
          <span style={{ marginLeft: 6 }}>{timeAgo(story.publishedAt)}</span>
        </div>
      </div>
    </li>
  );
}

/**
 * One parent cluster card.
 * isExpanded / onToggle is managed by InsightPage via a Record<parentId, boolean>.
 */
function ParentCard({ parent, storiesById, isExpanded, onToggle }) {
  const hiddenCount  = parent.hiddenDuplicateIds?.length ?? 0;
  const childCount   = parent.childStoryIds?.length ?? 0;
  const clusterCount = parent.debug?.clusterSize ?? parent.clusterStoryIds?.length ?? 1;
  const score        = (parent.finalParentScore || 0).toFixed(2);

  // Source name list from actual storiesById lookup — not from ID parsing
  const sourceNames = [...new Set(
    (parent.clusterStoryIds || [])
      .map(id => storiesById?.get(id)?.source)
      .filter(Boolean)
  )].slice(0, 3);

  return (
    <div style={{
      background: 'linear-gradient(180deg,rgba(22,27,34,0.6),rgba(14,18,24,0.6))',
      borderRadius: 14,
      border: `1px solid ${parent.weakTree
        ? 'rgba(217,119,6,0.5)'
        : 'rgba(48,54,61,0.65)'}`,
      marginBottom: 12,
      overflow: 'hidden',
      opacity: parent.weakTree ? 0.78 : 1,
      transition: 'opacity 0.15s',
    }}>

      {/* ── Header row ── */}
      <div
        style={{ padding: '14px 14px 12px', cursor: 'pointer', userSelect: 'none' }}
        onClick={onToggle}
      >
        {/* Badges row */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          {parent.isRising && (
            <span style={{
              background: '#854d0e', color: '#fef08a',
              padding: '2px 8px', borderRadius: 4,
              fontSize: 11, fontWeight: 700,
            }}>🔥 Rising</span>
          )}
          {parent.weakTree && (
            <span
              title="Fewer than 3 quality child stories found for this cluster"
              style={{
                background: '#78350f', color: '#fde68a',
                padding: '2px 8px', borderRadius: 4,
                fontSize: 11, fontWeight: 700,
              }}
            >⚠ Thin</span>
          )}
          <span style={{
            background: 'rgba(255,255,255,0.06)',
            color: 'var(--muted, #9CA5B0)',
            padding: '2px 8px', borderRadius: 4, fontSize: 11,
          }}>
            {score}
          </span>
        </div>

        {/* Headline */}
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: 16, fontWeight: 700,
          color: 'var(--txt, #FFFFFF)',
          lineHeight: '1.3',
        }}>
          {parent.canonicalHeadline}
        </h3>

        {/* Summary */}
        {parent.canonicalSummary && (
          <p style={{
            margin: '0 0 10px 0',
            fontSize: 13,
            color: 'var(--muted, #9CA5B0)',
            lineHeight: '1.5',
          }}>
            {parent.canonicalSummary.length > 200
              ? parent.canonicalSummary.slice(0, 200) + '…'
              : parent.canonicalSummary}
          </p>
        )}

        {/* Meta row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <SnapshotDots snapshotPresence={parent.snapshotPresence} />
            <span style={{ fontSize: 11, color: 'rgba(156,165,176,0.7)' }}>
              {clusterCount} {clusterCount === 1 ? 'story' : 'stories'}
            </span>
            {hiddenCount > 0 && (
              <span style={{ fontSize: 11, color: 'rgba(156,165,176,0.5)' }}>
                {hiddenCount} similar hidden
              </span>
            )}
            {/* Real source names — not id.split() garbage */}
            {sourceNames.length > 0 && (
              <div style={{ display: 'flex', gap: 4 }}>
                {sourceNames.map((s, i) => (
                  <span key={i} style={{
                    background: 'rgba(255,255,255,0.06)',
                    padding: '1px 6px', borderRadius: 3,
                    fontSize: 10, color: 'var(--muted, #9CA5B0)',
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={e => { e.stopPropagation(); onToggle(); }}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--txt, #FFFFFF)',
              cursor: 'pointer', fontWeight: 700,
              padding: '5px 12px', borderRadius: 6, fontSize: 12,
            }}
          >
            {isExpanded ? '− Hide' : `+ ${childCount} angle${childCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>

      {/* ── Children panel ── */}
      {isExpanded && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '8px 14px 12px',
          background: 'rgba(0,0,0,0.15)',
        }}>
          {childCount === 0 ? (
            <p style={{
              fontSize: 13, color: 'var(--muted, #9CA5B0)',
              padding: '8px 0', margin: 0,
            }}>
              No diverse child stories for this cluster.
            </p>
          ) : (
            <ul style={{ padding: 0, margin: 0 }}>
              {parent.childStoryIds.map(childId => (
                <ChildStory
                  key={childId}
                  childId={childId}
                  storiesById={storiesById}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ── Signal ring ───────────────────────────────────────────────────────────────
function SignalRing({ score, parents }) {
  const risingCount = parents.filter(p => p.isRising).length;
  const totalStories = parents.reduce((acc, p) => acc + (p.clusterStoryIds?.length || 0), 0);
  const pct = score / 100;
  const CIRCUMFERENCE = 251.2; // 2π × r(40)

  return (
    <div className="ins-pulse">
      <div className="ins-ring">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#00D4AA" />
              <stop offset="1" stopColor="#58A6FF" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="40" fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
          <circle cx="50" cy="50" r="40" fill="none"
            stroke="url(#rg)" strokeWidth="9" strokeLinecap="round"
            strokeDasharray={`${pct * CIRCUMFERENCE} ${CIRCUMFERENCE}`} />
        </svg>
        <div className="ircenter">
          <div className="irscore">{score}</div>
          <div className="irslbl">Signal</div>
        </div>
      </div>
      <div className="ins-body">
        <div className="eyebrow"><span className="bip" />Live feed</div>
        <p>
          {risingCount > 0
            ? <>Day active — <em>{risingCount} rising</em> {risingCount === 1 ? 'thread' : 'threads'}</>
            : <>Monitoring <em>{parents.length} clusters</em> across 4 snapshots</>
          }
        </p>
        <div className="ins-meta">
          <span>Just updated</span><span>·</span>
          <span><b>{parents.length}</b> clusters</span><span>·</span>
          <span><b>{totalStories}</b> stories</span>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function InsightPage() {
  // Store full InsightRunResult — not just parents[] —
  // so storiesById Map is accessible everywhere without prop-drilling.
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  const parents     = result?.parents     ?? [];
  const storiesById = result?.storiesById ?? new Map();
  const signalScore = computeSignalScore(parents);

  // ── Initial pipeline run ──────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const r = await runInsightPipeline(slotFetcher, DEFAULT_CONFIG);
        if (alive) setResult(r);
      } catch (e) {
        console.error('[InsightPage] Pipeline failed:', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // ── 5-minute incremental refresh ─────────────────────────────────────────
  // applyIncrementalUpdate arg order: (newStories, existingResult, cfg)
  // It only processes stories not already in result.storiesById — no full re-rank.
  // It updates isRising flags and attempts to slot new stories into existing parents.
  useEffect(() => {
    if (!result) return;
    const id = setInterval(async () => {
      try {
        const fresh = await slotFetcher('now');
        if (fresh.length > 0) {
          const updated = applyIncrementalUpdate(fresh, result, DEFAULT_CONFIG);
          setResult({ ...updated });
        }
      } catch (e) {
        console.warn('[InsightPage] Incremental update failed:', e);
        // Non-fatal — next interval will retry.
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [result]);

  const toggleExpand = useCallback((id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // ── Render states ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-container insight-page">
        <Header title="Insight" stateLabel="Loading" stateType="loading" />
        <div className="modern-container" style={{ padding: 16 }}>
          <div style={{ textAlign: 'center', paddingTop: 40, color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🧠</div>
            <p style={{ margin: 0, fontSize: 14 }}>Running AI pipeline across 4 snapshots…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!parents.length) {
    return (
      <div className="page-container insight-page">
        <Header title="Insight" stateLabel="Up to date" stateType="live" />
        <div className="modern-container" style={{ padding: 16 }}>
          <EmptyState
            icon="🧠"
            title="No Insights Available"
            message="Couldn't generate clusters from the latest news. Check that the news API is reachable."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container insight-page">
      <Header title="Insight" stateLabel="Live" stateType="live" />
      <div className="modern-container" style={{ padding: 16, paddingBottom: 80 }}>

        {/* Dynamic signal ring — score computed from real parent scores */}
        <SignalRing score={signalScore} parents={parents} />

        {/* Stats strip */}
        <div className="sstrip">
          <div className="sig" data-t="info">
            <div className="snum">{parents.length}</div>
            <div className="slb">Ranked</div>
          </div>
          <div className="sig" data-t="warn">
            <div className="snum">{parents.filter(p => p.isRising).length}</div>
            <div className="slb">Rising</div>
          </div>
          <div className="sig" data-t="good">
            <div className="snum">
              {parents.reduce((acc, p) => acc + (p.clusterStoryIds?.length || 0), 0)}
            </div>
            <div className="slb">Stories</div>
          </div>
          <div className="sig" data-t="teal">
            <div className="snum">
              {parents.filter(p => !p.weakTree).length}
              <span style={{ color: 'var(--muted)', fontSize: '.75rem' }}>
                /{parents.length}
              </span>
            </div>
            <div className="slb">Strong</div>
          </div>
          <div className="sig" data-t="mute">
            <div className="snum">{signalScore}</div>
            <div className="slb">Score</div>
          </div>
        </div>

        {/* Section header */}
        <div className="isec">
          <h3><span className="glyph">▲</span>Top Ranked</h3>
          <span className="imeta">
            <b>{parents.length}</b> shown · tap to expand angles
          </span>
        </div>

        {/* Parent cards */}
        {parents.map(p => (
          <ParentCard
            key={p.parentId}
            parent={p}
            storiesById={storiesById}
            isExpanded={!!expanded[p.parentId]}
            onToggle={() => toggleExpand(p.parentId)}
          />
        ))}
      </div>
    </div>
  );
}
