import React from "react";

const toneStrokeColors = {
  teal: '#0e9f92',
  critical: '#d94f5c',
  warning: '#d88719',
  safe: '#0e9f92',
};

export default function Gauge({ label, value, tone = "teal", detail, suffix = "%", max = 100 }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;
  const strokeColor = toneStrokeColors[tone] || toneStrokeColors.teal;
  const ratio = (value / max) * 100;
  const statusText = ratio > 80 ? "CRITICAL" : ratio > 60 ? "ELEVATED" : "NORMAL";
  const statusStyle = ratio > 80
    ? { color: '#d94f5c', background: '#fdf2f4' }
    : value > 60
      ? { color: '#b45309', background: '#fef7e8' }
      : { color: '#087267', background: '#e6f8f6' };

  return (
    <article style={{
      background: '#fff',
      border: '1px solid #e8eef2',
      borderRadius: 16,
      padding: '22px 20px',
      transition: 'all .35s ease',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(20,43,58,.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', gap: 12,
      }}>
        <span style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: 11, fontWeight: 600,
          letterSpacing: '.06em', textTransform: 'uppercase',
          color: '#61717c',
        }}>{label}</span>
        <span style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: 9, fontWeight: 700,
          letterSpacing: '.08em', textTransform: 'uppercase',
          padding: '4px 8px', borderRadius: 6,
          ...statusStyle,
        }}>{statusText}</span>
      </div>
      <div style={{
        width: 140, height: 140,
        margin: '16px auto',
        position: 'relative',
      }}>
        <svg viewBox="0 0 110 110" width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="55" cy="55" r={radius}
            fill="none" strokeWidth="8"
            stroke="#e8eef2"
          />
          <circle
            cx="55" cy="55" r={radius}
            fill="none" strokeWidth="8"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <strong style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Barlow', sans-serif",
          fontSize: 24, fontWeight: 800,
          color: '#122331',
        }}>{value}{suffix}</strong>
      </div>
      <p style={{
        borderTop: '1px solid #e8eef2',
        paddingTop: 12, margin: 0,
        color: '#8896a1', fontSize: 11,
        lineHeight: 1.4,
      }}>{detail}</p>
    </article>
  );
}
