import React, { useState } from 'react';

function formatAngle(angle, fallbackIndex) {
  const map = {
    base_report: 'Base report',
    official_response: 'Official response',
    market_reaction: 'Market reaction',
    fact_update: 'Fact update',
    expert_analysis: 'Expert analysis',
    regional_followup: 'Regional follow-up',
    correction: 'Correction',
    background_context: 'Background',
    reaction_public: 'Public reaction',
    investigative_detail: 'Investigative detail',
    unknown: 'Related angle'
  };
  return map[angle] || `Angle ${fallbackIndex + 1}`;
}

export default function InsightDigestCard({ card, index }) {
  const [open, setOpen] = useState(false);
  const pct = Math.min(Math.round((card.score || 0) * 100), 100);

  const isBreaking = card.bucket === 'developing_now';
  const srcCount   = card.sourceCount || 1;
  const timeAgo    = 'Live';

  // Deduplicate sources from angles
  const sources = [...new Set(card.angles?.map(a => a.source) || [])].slice(0, 3);
  const hiddenCount = card.hiddenDuplicateCount || 0;

  return (
    <div className={`icard ${open ? 'open' : ''}`} data-top="true">
      <div className="icard-top" onClick={() => setOpen(o => !o)}>
        <div className="irank">{String(index + 1).padStart(2, '0')}</div>
        <div className="ibody">
          <div className="imeta-row">
            <span className="isource">Cluster</span><span className="idot" />
            <span className="itime">{timeAgo}</span>
            <span className="itag">{card.bucket?.replace(/_/g, ' ')}</span>
            {isBreaking && <span className="itag breaking">🔥 Rising</span>}
            {srcCount > 1 && <span className="itag multi">{srcCount} stories</span>}
            {card.independentSourceCount > 1 && <span className="itag multi">{card.independentSourceCount} sources</span>}
            {hiddenCount > 0 && <span className="itag" style={{ background: 'rgba(255,255,255,0.1)', color: '#D0D7DE' }}>{hiddenCount} dupes hidden</span>}
            {card.topStoryAnchorScore >= 0.62 && <span className="itag multi" style={{ background: 'rgba(88,166,255,0.15)', color: '#58A6FF' }}>Top story match {(card.topStoryAnchorScore * 100).toFixed(0)}%</span>}
            {card.coverageLabel && <span className="itag" style={{ background: '#333', color: '#ccc' }}>{card.coverageLabel}</span>}
          </div>
          <h3>{card.headline}</h3>
          <div className="iimpact">
            <div className="ibar"><span style={{ width: `${pct}%` }} /></div>
            <div className="ival">{(card.score || 0).toFixed(2)}</div>
          </div>
          <div className="isrcs">{sources.map((s, i) => <span key={i} className="s">{s}</span>)}</div>
        </div>
        <button className="expand-btn" tabIndex={-1}>{open ? '−' : '+'}</button>
      </div>
      {open && (
        <div className="iexpand"><div className="iexpand-inner">
          <div className="exp-block">
            <div className="exp-label"><span className="dot" />Summary</div>
            <p className="exp-summary">{card.summary}</p>
          </div>
          {card.whyItMatters && (
             <div className="exp-block critics-box">
                <div className="exp-label"><span className="dot" style={{ background: '#58A6FF' }}/>Why It Matters</div>
                <p className="ctxt">{card.whyItMatters}</p>
             </div>
          )}
          <div className="exp-block">
            <div className="exp-label"><span className="dot" style={{ background: 'var(--warn, #F0883E)' }} />Child Stories</div>
            <div className="src-list">
              {Array.isArray(card.angles) && card.angles.length > 0 ? (
                card.angles.map((angleObj, i) => (
                  <div key={i} className="src-item">
                    <span className="sname" title={angleObj.source}>{angleObj.source}</span>
                    <span className="sdesc">{angleObj.admittedBecause?.join(', ')}</span>
                    <span className="ang diff">{formatAngle(angleObj.angle, i)}</span>
                  </div>
                ))
              ) : (
                <div className="src-item" style={{ opacity: 0.5, fontStyle: 'italic' }}>
                  <span className="sdesc">No additional angles found for this story</span>
                </div>
              )}
            </div>
          </div>
        </div></div>
      )}
    </div>
  );
}
