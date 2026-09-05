import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import ConfidenceChart from "../components/charts/ConfidenceChart";
import ThreatDistribution from "../components/charts/ThreatDistribution";
import useAlerts from "../hooks/useAlerts";
import useSystemBehavior from "../hooks/useSystemBehavior";

/* Shared panel wrapper */
const Panel = ({ children, className = "" }) => (
  <article className={`bg-white border border-[#e8eef2] rounded-2xl p-[26px_24px] transition-all duration-350 hover:shadow-hover ${className}`}>
    {children}
  </article>
);

/* Shared button */
const Btn = ({ children, variant = 'secondary', onClick, to, className = "" }) => {
  const base = "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-sans cursor-pointer no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,.1)]";

  const variants = {
    primary: "bg-teal border-2 border-teal-dark text-white",
    danger: "bg-red border-2 border-[#c53030] text-white",
    secondary: "bg-white border-[1.5px] border-[#d6e0e4] text-ink hover:border-teal hover:text-teal-dark",
  };

  const merged = `${base} ${variants[variant]} ${className}`;

  if (to) return <Link to={to} className={merged}>{children}</Link>;
  return <button className={merged} onClick={onClick}>{children}</button>;
};

export default function Overview() {
  const { alerts, status } = useAlerts();
  const { sysAlerts, status: sysStatus } = useSystemBehavior();

  const totalFlows = alerts.length;
  const attackCount = alerts.filter((a) => a.is_attack).length;
  const normalCount = totalFlows - attackCount;
  const attackRate = totalFlows ? Math.round((attackCount / totalFlows) * 100) : 0;

  const sysAnomalyCount = sysAlerts.filter((s) => s.is_anomaly).length;
  const sysTotal = sysAlerts.length;
  const normalBaselinePct = sysTotal
    ? (((sysTotal - sysAnomalyCount) / sysTotal) * 100).toFixed(1) + "%"
    : "—";

  const riskScore = attackRate;
  const riskTone = riskScore >= 50 ? "critical" : riskScore >= 20 ? "warning" : "safe";
  const riskLabel = riskScore >= 50 ? "High risk" : riskScore >= 20 ? "Elevated" : "Nominal";

  const confidenceTrend = [...alerts]
    .reverse()
    .slice(-20)
    .map((a) => Math.round((a.confidence || 0) * 100));

  const distTotal = attackCount + sysAnomalyCount + normalCount || 1;
  const threatDistribution = [
    Math.round((attackCount / distTotal) * 100),
    Math.round((sysAnomalyCount / distTotal) * 100),
    Math.round((normalCount / distTotal) * 100),
  ];

  const recentFlagged = alerts.filter((a) => a.is_attack).slice(0, 5);
  const bothConnected = status === "connected" && sysStatus === "connected";

  return (
    <div className="flex flex-col gap-7 font-sans">
      <PageHeader
        eyebrow="Layer 1 + Layer 2 detection / local demo instance"
        title="Security Posture"
        description="Live behavioral anomaly telemetry from the network traffic classifier and system behavior monitor running on this machine."
      />

      {/* Risk + KPIs */}
      <section className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-[18px]">
        {/* Risk card */}
        <article className="bg-white border border-[#e8eef2] border-l-4 border-l-red rounded-2xl p-[28px_26px] flex flex-col gap-3.5 transition-all duration-350 hover:shadow-[0_16px_40px_rgba(217,79,92,.1)]">
          <div className="flex justify-between items-center">
            <span className="font-sans text-[11px] font-semibold tracking-[0.06em] uppercase text-muted">
              Network attack rate (live)
            </span>
            <StatusBadge tone={riskTone}>{riskLabel}</StatusBadge>
          </div>
          <strong className="font-sans text-[52px] font-black text-red">
            {riskScore}
            <small className="text-base font-medium text-[#8896a1] font-sans"> / 100</small>
          </strong>
          <h3 className="text-[15px] font-bold text-ink m-0">
            {totalFlows === 0
              ? "Waiting for traffic data"
              : `${attackCount} of ${totalFlows} recent flows flagged as attacks`}
          </h3>
          <p className="text-[13px] text-muted leading-relaxed m-0">
            Computed live from the LightGBM classifier's predictions on the last {totalFlows} network flows.
          </p>
          <div className="flex h-2 rounded-full overflow-hidden bg-[#eef2f7] mt-auto">
            <i className="bg-red block transition-all duration-500" style={{ width: `${attackRate}%` }} />
            <i className="bg-[#eef2f7] block transition-all duration-500" style={{ width: `${100 - attackRate}%` }} />
          </div>
          <span className="font-sans text-[10px] text-[#8896a1] tracking-[0.04em]">
            <Link to="/network" className="text-teal cursor-pointer">Inspect network flows →</Link>
          </span>
        </article>

        {/* KPI grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <StatCard
            label="Flows analyzed"
            value={totalFlows.toLocaleString()}
            detail="Live count from /alerts"
            icon="↗"
          />
          <StatCard
            label="Network attacks"
            value={attackCount}
            detail="Flagged by LightGBM classifier"
            tone="critical"
            icon="!"
          />
          <StatCard
            label="System anomalies"
            value={sysAnomalyCount}
            detail="Flagged by Isolation Forest"
            tone="warning"
            icon="~"
          />
          <StatCard
            label="Normal baseline events"
            value={normalBaselinePct}
            detail="System behavior within baseline"
            tone="safe"
            icon="✓"
          />
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[18px]">
        <Panel>
          <div className="flex justify-between items-start mb-5 gap-3">
            <div>
              <h2 className="text-[17px] font-bold text-ink m-0 mb-1">Attack Confidence - Live Trend</h2>
              <p className="text-[13px] text-[#8896a1] m-0">
                LightGBM confidence score on the last {confidenceTrend.length} network flows.
              </p>
            </div>
            <StatusBadge tone={bothConnected ? "safe" : "warning"}>
              {bothConnected ? "Live telemetry" : "Reconnecting..."}
            </StatusBadge>
          </div>
          <ConfidenceChart values={confidenceTrend} />
        </Panel>
        <Panel>
          <div className="mb-5">
            <h2 className="text-[17px] font-bold text-ink m-0 mb-1">Threat Distribution</h2>
            <p className="text-[13px] text-[#8896a1] m-0">Live split across both detection layers.</p>
          </div>
          <ThreatDistribution values={threatDistribution} />
        </Panel>
      </section>

      {/* Activity table - real flagged flows, not fabricated hosts */}
      <Panel>
        <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-ink m-0 mb-1">Recent Flagged Network Flows</h2>
            <p className="text-[13px] text-[#8896a1] m-0">
              Most recent flows classified as attacks by Layer 1.
            </p>
          </div>
          <Btn to="/network">Inspect network</Btn>
        </div>
        <div>
          {recentFlagged.length === 0 ? (
            <div className="py-4 text-center text-[13px] text-muted">No attacks flagged yet</div>
          ) : (
            recentFlagged.map((alert, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-3 py-4 border-t border-[#e8eef2] text-[13px]">
                <div className="min-w-[120px]">
                  <strong className="text-ink block">{alert.src_ip || `Host-${idx}`}</strong>
                  <small className="text-[#8896a1] font-normal text-[11px]">→ {alert.dst_ip || "Unknown"}{alert.dst_port ? `:${alert.dst_port}` : ""}</small>
                </div>
                <span className="font-sans text-xs text-ink font-semibold whitespace-nowrap">{alert.confidence ? Math.round(alert.confidence * 100) : (alert.is_attack ? 95 : 15)} / 100</span>
                <span className="text-muted whitespace-nowrap">{alert.description || "Anomaly detected"}</span>
                <div className="ml-auto flex items-center gap-3">
                  <StatusBadge tone="ai">
                    Investigating
                  </StatusBadge>
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>

      {/* Connection note */}
      <div className="text-center py-2">
        <StatusBadge tone={bothConnected ? "safe" : "warning"}>
          {bothConnected ? "Both detection layers connected" : "One or more layers disconnected"}
        </StatusBadge>
      </div>
    </div>
  );
}
