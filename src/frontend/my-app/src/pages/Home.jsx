import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";

const capabilities = [
  ['Behavioral Baseline & Anomaly Detection', 'Continuously self-calibrating machine learning models establish enterprise norms.'],
  ['Attack-Chain Reconstruction', 'Automatically piece fragmented log traces into chronological attack paths.'],
  ['Predictive Threat Simulation', 'Simulate prospective adversarial scenarios before deployment.'],
  ['Explainable Risk Scoring', 'Eliminate black-box risk with human-readable hypotheses.'],
  ['AI-Assisted Automated Response', 'Orchestrate quarantine, investigation, and recovery with confidence.'],
  ['Multi-Source Telemetry Ingestion', 'Correlate endpoint, network, and identity evidence in one view.'],
];

const steps = [
  ["01", "Learn Normal", "Build a living behavioral baseline."],
  ["02", "Detect Deviation", "Spot small changes before signatures exist."],
  ["03", "Correlate Signals", "Connect weak evidence across your estate."],
  ["04", "Assess Risk", "Prioritize what needs attention now."],
];


const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const LockIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const ScanIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
    <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
  </svg>
);

const NetworkIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3" />
    <circle cx="5" cy="19" r="3" />
    <circle cx="19" cy="19" r="3" />
    <line x1="12" y1="8" x2="5" y2="16" />
    <line x1="12" y1="8" x2="19" y2="16" />
  </svg>
);

const RadarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
    <line x1="12" y1="2" x2="12" y2="12" />
  </svg>
);

const FingerprintIcon = () => (
  <svg width="28" height="28" viewBox="-1 -1 26 26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
    <path d="M5 19.5C5.5 18 6 15 6 12c0-3.5 2.5-6 6-6a6 6 0 0 1 5 2.5" />
    <path d="M10 22c.5-3 1-6 1-10 0-2 1-3.5 3-3.5s3 1.5 3 3.5c0 2-.5 4-1 6" />
    <path d="M14.5 22c.5-2 .5-3.5.5-5" />
  </svg>
);

const BoltIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const CursorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 2l16 10-7 2 4 8-3 1-4-8-6 5V2z" />
  </svg>
);


const floatingIcons = [
  { id: 'shield', pos: { top: '12%', left: '8%' }, size: 72, radius: 18, bg: 'linear-gradient(135deg, #0e9f92, #087267)', color: '#fff', rot: -12, delay: 0, Icon: ShieldIcon, hideOnMd: false },
  { id: 'lock', pos: { top: '10%', right: '10%' }, size: 80, radius: 20, bg: 'linear-gradient(135deg, #2d3748, #1a202c)', color: '#a0aec0', rot: 8, delay: -1, Icon: LockIcon, hideOnMd: false },
  { id: 'scan', pos: { top: '45%', left: '4%' }, size: 64, radius: 16, bg: 'linear-gradient(135deg, #f56565, #c53030)', color: '#fff', rot: -6, delay: -2, Icon: ScanIcon, hideOnMd: true },
  { id: 'network', pos: { top: '42%', right: '5%' }, size: 68, radius: 16, bg: 'linear-gradient(135deg, #ed8936, #dd6b20)', color: '#fff', rot: 10, delay: -3, Icon: NetworkIcon, hideOnMd: false },
  { id: 'radar', pos: { bottom: '18%', left: '12%' }, size: 60, radius: 14, bg: 'linear-gradient(135deg, #667eea, #4c51bf)', color: '#fff', rot: 6, delay: -4, Icon: RadarIcon, hideOnMd: true },
  { id: 'fingerprint', pos: { bottom: '15%', right: '12%' }, size: 66, radius: 16, bg: 'linear-gradient(135deg, #38b2ac, #2c7a7b)', color: '#fff', rot: -8, delay: -5, Icon: FingerprintIcon, hideOnMd: false },
  { id: 'bolt', pos: { bottom: '22%', right: '22%' }, size: 54, radius: 14, bg: 'linear-gradient(135deg, #1a202c, #2d3748)', color: '#fbd38d', rot: 12, delay: -3.5, Icon: BoltIcon, hideOnMd: false },
  { id: 'cursor', pos: { top: '55%', left: '22%' }, size: 48, radius: 12, bg: '#1a202c', color: '#fff', rot: -15, delay: -2.5, Icon: CursorIcon, hideOnMd: true },
];

const ProximityGrid = () => {
  const containerRef = useRef(null);
  const circlesRef = useRef([]);

  // Grid dimensions
  const cols = 50;
  const rows = 25;
  const spacing = 36; // px between dots

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      circlesRef.current.forEach((circle, i) => {
        if (!circle) return;
        const c_x = (i % cols) * spacing;
        const c_y = Math.floor(i / cols) * spacing;

        const dx = c_x - x;
        const dy = c_y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const maxDist = 200;
        let scale = 1;
        let opacity = 0.15;

        if (dist < maxDist) {
          const intensity = 1 - (dist / maxDist);
          scale = 1 + intensity * 3;
          opacity = 0.15 + intensity * 0.85;
        }

        circle.style.transform = `scale(${scale})`;
        circle.style.opacity = opacity;
      });
    };

    const handleMouseLeave = () => {
      circlesRef.current.forEach((circle) => {
        if (!circle) return;
        circle.style.transform = `scale(1)`;
        circle.style.opacity = 0.15;
      });
    };

    const node = containerRef.current;
    if (node) {
      node.addEventListener('mousemove', handleMouseMove);
      node.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      if (node) {
        node.removeEventListener('mousemove', handleMouseMove);
        node.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(
        <circle
          key={`${r}-${c}`}
          ref={el => circlesRef.current[r * cols + c] = el}
          cx={c * spacing}
          cy={r * spacing}
          r={1.5}
          fill="#0e9f92"
          style={{
            opacity: 0.15,
            transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
            transformOrigin: `${c * spacing}px ${r * spacing}px`
          }}
        />
      );
    }
  }

  return (
    <div ref={containerRef} style={{
      position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: cols * spacing, height: '100%',
      overflow: 'hidden', zIndex: 0, pointerEvents: 'auto',
      maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
      WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
    }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${cols * spacing} ${rows * spacing}`}>
        {dots}
      </svg>
    </div>
  );
};

export default function Home() {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (
        !window.matchMedia ||
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        gsap.from(".hero-reveal", {
          opacity: 0,
          y: 30,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
        });
        gsap.from(".float-icon", {
          opacity: 0,
          scale: 0.5,
          duration: 1,
          stagger: 0.08,
          ease: "back.out(1.7)",
          delay: 0.3,
        });
      }
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} style={{ fontFamily: "'Inter', 'Barlow', sans-serif" }}>


      <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center px-4 md:px-10 py-[60px] pb-[80px] overflow-hidden">

        <ProximityGrid />

        {/* ── Floating 3D icons ── */}
        <div className="float-icons-wrap" style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}>
          {floatingIcons.map(({ id, pos, size, radius, bg, color, rot, delay, Icon, hideOnMd }) => (
            <div
              key={id}
              className={`float-icon ${hideOnMd ? 'hide-md' : ''}`}
              style={{
                position: 'absolute',
                ...pos,
                width: size,
                height: size,
                borderRadius: radius,
                background: bg,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,.12), 0 4px 12px rgba(0,0,0,.06)',
                animation: `floatBounce 6s ease-in-out infinite`,
                animationDelay: `${delay}s`,
                transform: `rotate(${rot}deg)`,
              }}
            >
              <Icon />
            </div>
          ))}

          {/* Toggle chip */}
          <div
            className="float-icon hide-md"
            style={{
              position: 'absolute',
              top: '12%',
              left: '25%',
              width: 58,
              height: 34,
              borderRadius: 17,
              background: '#48bb78',
              animation: 'floatBounce 6s ease-in-out infinite',
              animationDelay: '-1.5s',
              boxShadow: '0 8px 30px rgba(72,187,120,.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{
              position: 'absolute',
              right: 4,
              top: 4,
              width: 26,
              height: 26,
              background: '#fff',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,.15)',
            }} />
          </div>
        </div>

        {/* ── Hero content ── */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 900,
          margin: '0 auto',
        }}>

          {/* Eyebrow tag */}
          <div className="hero-reveal" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(14,159,146,0.08)',
            border: '1px solid rgba(14,159,146,0.2)',
            color: '#087267',
            fontFamily: "'Barlow', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            padding: '8px 16px',
            borderRadius: 100,
            marginBottom: 28,
          }}>
            <span style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: '#0e9f92',
              display: 'inline-block',
              animation: 'pulseDot 2s ease infinite',
            }} />
            Zero-day behavioral telemetry / Core v4.8
          </div>

          {/* Title */}
          <h1 className="hero-reveal" style={{
            fontSize: 'clamp(40px, 10vw, 92px)',
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            color: '#122331',
            margin: '0 0 12px',
          }}>
            Detect Compromise
            <br />
            <em style={{ fontStyle: 'normal', color: '#0e9f92' }}>Before the Signature Exists.</em>
          </h1>

          {/* Subtitle */}
          <p className="hero-reveal" style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: '#61717c',
            maxWidth: 640,
            margin: '24px auto 0',
            lineHeight: 1.55,
          }}>
            AEGIS AI learns how your systems and networks normally behave, then
            correlates weak signals to identify potential compromise even when
            no known IoC exists.
          </p>

          {/* CTA buttons */}
          <div className="hero-reveal" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            marginTop: 44,
            flexWrap: 'wrap',
          }}>
            <Link
              to="/overview"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                background: '#1a202c',
                color: '#fff',
                padding: '16px 32px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 8px 30px rgba(0,0,0,.18)',
                transition: 'transform .3s ease, box-shadow .3s ease, background .3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,.25)';
                e.currentTarget.style.background = '#2d3748';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,.18)';
                e.currentTarget.style.background = '#1a202c';
              }}
            >
              Open Security Dashboard
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34, height: 34,
                background: '#0e9f92',
                borderRadius: 8,
                fontSize: 18,
              }}>→</span>
            </Link>

            <a
              href="#how-it-works"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#61717c',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                padding: '14px 24px',
                border: '1.5px solid #d6e0e4',
                borderRadius: 12,
                background: '#fff',
                transition: 'all .3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#0e9f92';
                e.currentTarget.style.color = '#087267';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(14,159,146,.12)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#d6e0e4';
                e.currentTarget.style.color = '#61717c';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              See How It Works
            </a>
          </div>

          {/* Metrics — horizontal row */}
          <div className="hero-reveal" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 48,
            marginTop: 56,
            paddingTop: 36,
            borderTop: '1px solid rgba(0,0,0,.06)',
            flexWrap: 'wrap',
          }}>
            {[
              ["4.2ms", "Inference latency"],
              ["99.7%", "Weak signal capture"],
              ["0-Day", "Pre-signature defense"],
            ].map(([value, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <span style={{
                  display: 'block',
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#0e9f92',
                }}>{value}</span>
                <span style={{
                  display: 'block',
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                  color: '#8896a1',
                  marginTop: 6,
                }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>



      <section className="section-reveal px-4 md:px-10 py-12 md:py-20" id="how-it-works" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{
            display: 'inline-block',
            fontFamily: "'Barlow', sans-serif",
            fontSize: 11, fontWeight: 600, letterSpacing: '.06em',
            textTransform: 'uppercase', color: '#0e9f92', marginBottom: 12,
          }}>
            The adaptive security blindspot
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800, color: '#122331',
            letterSpacing: '-.03em', lineHeight: 1.1,
            margin: '0 0 14px',
          }}>
            Traditional Detection Knows the Past.
            <br />
            Attackers Exploit the Unknown.
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {/* Card 1 */}
          <article style={{
            background: '#fff', border: '1px solid #e8eef2',
            borderRadius: 16, padding: '32px 28px',
            transition: 'all .35s ease',
            cursor: 'default',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(20,43,58,.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{
              width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 12, background: 'rgba(14,159,146,.1)', color: '#087267',
              fontSize: 22, fontWeight: 700, marginBottom: 18,
            }}>◌</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#122331', margin: '0 0 8px' }}>Traditional Detection</h3>
            <p style={{ fontSize: 14, color: '#61717c', lineHeight: 1.6, margin: '0 0 12px' }}>
              State detection is tuned to known threats and previously observed signatures.
            </p>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 10, color: '#8896a1', letterSpacing: '.04em' }}>
              Known IoC rules / fixed baselines
            </span>
          </article>

          {/* Card 2 — accent */}
          <article style={{
            background: '#fff', border: '1px solid #e8eef2',
            borderTop: '3px solid #d88719',
            borderRadius: 16, padding: '32px 28px',
            transition: 'all .35s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(20,43,58,.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{
              width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 12, background: 'rgba(216,135,25,.1)', color: '#b45309',
              fontSize: 22, fontWeight: 700, marginBottom: 18,
            }}>◈</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#122331', margin: '0 0 8px' }}>Modern Attacker Reality</h3>
            <p style={{ fontSize: 14, color: '#61717c', lineHeight: 1.6, margin: '0 0 12px' }}>
              Adversaries move quietly through living infrastructure, leaving fragmented traces.
            </p>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 10, color: '#8896a1', letterSpacing: '.04em' }}>
              Zero-day behavior / lateral movement
            </span>
          </article>

          {/* Card 3 — highlight */}
          <article style={{
            background: 'linear-gradient(135deg, #f0fffe, #fff)',
            border: '1px solid #a9e8df',
            borderRadius: 16, padding: '32px 28px',
            transition: 'all .35s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(20,43,58,.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <span style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: 11, fontWeight: 600, letterSpacing: '.06em',
              textTransform: 'uppercase', color: '#0e9f92',
            }}>
              The critical question
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#122331', margin: '12px 0 8px' }}>
              Is this system compromised right now?
            </h3>
            <p style={{ fontSize: 14, color: '#61717c', lineHeight: 1.6, margin: 0 }}>
              AEGIS AI answers with context, confidence, and a response path.
            </p>
          </article>
        </div>
      </section>



      <section className="section-reveal px-4 md:px-10 py-12 md:py-20">
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{
              display: 'inline-block',
              fontFamily: "'Barlow', sans-serif",
              fontSize: 11, fontWeight: 600, letterSpacing: '.06em',
              textTransform: 'uppercase', color: '#0e9f92', marginBottom: 12,
            }}>
              Autonomous pipeline
            </span>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800, color: '#122331',
              letterSpacing: '-.03em', lineHeight: 1.1,
              margin: '0 0 14px',
            }}>
              How AEGIS AI Solves It
            </h2>
            <p style={{ color: '#61717c', fontSize: 17, maxWidth: 600, margin: '0 auto', lineHeight: 1.5 }}>
              Four interconnected mathematical phases turn raw telemetry into
              actionable compromise intelligence.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
          }}>
            {steps.map(([number, title, text]) => (
              <article
                key={number}
                style={{
                  background: '#fff', border: '1px solid #e8eef2',
                  borderTop: '3px solid #0e9f92',
                  borderRadius: 16, padding: '28px 24px',
                  transition: 'all .35s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(20,43,58,.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <span style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: 32, fontWeight: 800,
                    color: 'rgba(14,159,146,.2)',
                  }}>{number}</span>
                  <span style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: 9, fontWeight: 700, letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    padding: '5px 10px', borderRadius: 6,
                    background: '#e6f8f6', color: '#087267',
                  }}>ACTIVE</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#122331', margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#61717c', lineHeight: 1.55, margin: 0 }}>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>



      <section className="section-reveal px-4 md:px-10 py-12 md:py-20" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 56 }}>
          <span style={{
            display: 'inline-block',
            fontFamily: "'Barlow', sans-serif",
            fontSize: 11, fontWeight: 600, letterSpacing: '.06em',
            textTransform: 'uppercase', color: '#0e9f92', marginBottom: 12,
          }}>
            Engine architecture
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800, color: '#122331',
            letterSpacing: '-.03em', lineHeight: 1.1,
            margin: 0,
          }}>
            Key Capabilities
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {capabilities.map(([title, text]) => (
            <article
              key={title}
              style={{
                background: '#fff', border: '1px solid #e8eef2',
                borderRadius: 16, padding: '28px 24px',
                transition: 'all .35s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(20,43,58,.1)';
                e.currentTarget.style.borderColor = 'rgba(14,159,146,.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e8eef2';
              }}
            >
              <div style={{
                width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, background: 'rgba(14,159,146,.08)', color: '#0e9f92',
                fontSize: 18, fontWeight: 800, marginBottom: 16,
              }}>+</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#122331', margin: '0 0 8px' }}>{title}</h3>
              <p style={{ fontSize: 13, color: '#61717c', lineHeight: 1.55, margin: 0 }}>{text}</p>
            </article>
          ))}
        </div>
      </section>



      <section
        className="section-reveal mx-4 md:mx-auto mb-16 px-6 md:px-14 py-10 md:py-12"
        style={{
          maxWidth: 1200,
          background: '#fff',
          border: '1.5px solid #a9e8df',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 32,
          flexWrap: 'wrap',
          transition: 'all .3s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 16px 50px rgba(14,159,146,.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
      >
        <div>
          <span style={{
            display: 'block',
            fontFamily: "'Barlow', sans-serif",
            fontSize: 11, fontWeight: 600, letterSpacing: '.06em',
            textTransform: 'uppercase', color: '#0e9f92', marginBottom: 6,
          }}>
            Operational elasticity
          </span>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#122331', letterSpacing: '-.02em', margin: '0 0 8px' }}>
            From one machine to an entire network.
          </h2>
          <p style={{ color: '#61717c', fontSize: 15, margin: 0 }}>
            Behavioral security that grows with your infrastructure.
          </p>
        </div>
        <Link
          to="/overview"
          className="w-full md:w-auto flex items-center justify-center gap-3 px-5 py-4 md:px-8 md:py-4 rounded-xl text-[15px] font-bold text-white bg-[#1a202c] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-[#2d3748]"
          style={{
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          Launch Live Dashboard
          <span className="inline-flex items-center justify-center w-8 h-8 md:w-[34px] md:h-[34px] bg-[#0e9f92] rounded-lg text-lg">→</span>
        </Link>
      </section>

    </div>
  );
}
