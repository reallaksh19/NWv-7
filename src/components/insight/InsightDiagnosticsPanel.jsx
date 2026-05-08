import React from 'react';

export default function InsightDiagnosticsPanel({ diagnostics }) {
  if (!diagnostics) return null;
  return (
    <div className="insight-diagnostics" style={{ marginTop: '30px', padding: '15px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', borderRadius: '8px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#00D4AA' }}>Debug Diagnostics</h4>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#D0D7DE' }}>
        {JSON.stringify(diagnostics, null, 2)}
      </pre>
    </div>
  );
}
