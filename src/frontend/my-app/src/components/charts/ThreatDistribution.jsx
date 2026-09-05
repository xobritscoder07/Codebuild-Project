import React from "react";

export default function ThreatDistribution({ values = [45, 35, 20], totalCount }) {
  const colors = ["#e85d75", "#f59e0b", "#14b8a6"];
  const labels = ["Network attack", "System compromise", "Baseline deviation"];
  // Center label shows the real underlying count if provided, otherwise
  // falls back to the percentage sum (legacy behavior).
  const centerValue = totalCount !== undefined ? totalCount : values.reduce((sum, v) => sum + v, 0);
  const centerLabel = totalCount !== undefined ? "Total events" : "Total flags";

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 24,
    }}>
      <div style={{
        width: 158, height: 158,
        borderRadius: '50%',
        background: `conic-gradient(${colors[0]} 0 ${values[0]}%, ${colors[1]} ${values[0]}% ${values[0] + values[1]}%, ${colors[2]} ${values[0] + values[1]}% 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 30px rgba(0,0,0,.06)',
      }}>
        <div style={{
          width: 108, height: 108,
          borderRadius: '50%',
          background: '#fff',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
        }}>
          <strong style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: 26, fontWeight: 800,
            color: '#122331',
          }}>{centerValue}</strong>
          <small style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: 9, color: '#8896a1',
            textTransform: 'uppercase',
            letterSpacing: '.06em',
          }}>{centerLabel}</small>
        </div>
      </div>
      <div style={{
        width: '100%',
        display: 'flex', flexDirection: 'column',
        gap: 10,
      }}>
        {labels.map((lbl, i) => (
          <div key={lbl} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            color: '#61717c',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i style={{
                width: 8, height: 8,
                borderRadius: '50%',
                background: colors[i],
                display: 'inline-block',
                flexShrink: 0,
              }} />
              {lbl}
            </span>
            <b style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 700,
              color: '#122331',
            }}>{values[i]}%</b>
          </div>
        ))}
      </div>
    </div>
  );
}
