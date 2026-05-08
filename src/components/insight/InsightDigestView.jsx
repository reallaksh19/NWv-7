import React from 'react';
import InsightDigestCard from './InsightDigestCard.jsx';
import InsightDiagnosticsPanel from './InsightDiagnosticsPanel.jsx';

export default function InsightDigestView({ digest, diagnostics, stale, ageMs }) {
  const cards = digest.cards || [];
  const sourceLabel = stale ? 'Stale Digest' : 'Workflow Digest';
  const ageHrs = Math.round(ageMs / 3600000);

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
          <p>Day leans <em>positive</em> — <em>{cards.filter(c => c.bucket === 'developing_now').length} breaking</em> threads active</p>
          <div className="ins-meta">
            <span>{stale ? `Updated ${ageHrs}h ago` : 'Just updated'}</span><span>·</span>
            <span><b>{cards.length}</b> clusters</span>
          </div>
        </div>
      </div>
      <div className="sstrip">
        <div className="sig" data-t="info"><div className="snum">{cards.length}</div><div className="slb">Ranked</div></div>
        <div className="sig" data-t="warn"><div className="snum">{cards.filter(c => c.bucket === 'developing_now').length}</div><div className="slb">Rising</div></div>
        <div className="sig" data-t="good"><div className="snum">{cards.reduce((acc, c) => acc + c.sourceCount, 0)}</div><div className="slb">Stories</div></div>
        <div className="sig" data-t="mute"><div className="snum">{sourceLabel}</div><div className="slb">Fresh</div></div>
      </div>
      <div className="isec">
        <h3><span className="glyph">▲</span>Top Ranked</h3>
        <span className="imeta"><b>{cards.length}</b> shown · tap + to expand</span>
      </div>
      {cards.map((c, i) => (
        <InsightDigestCard key={c.eventId} card={c} index={i} />
      ))}
      {localStorage.getItem('nwv7_insight_debug') === '1' && (
        <InsightDiagnosticsPanel diagnostics={diagnostics} />
      )}
    </div>
  );
}
