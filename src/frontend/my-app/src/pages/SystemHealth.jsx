import React from "react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import StatCard from "../components/StatCard";
import Gauge from "../components/charts/Gauge";
import ConfidenceChart from "../components/charts/ConfidenceChart";
import useSystemBehavior from "../hooks/useSystemBehavior";

const Panel = ({ children, className = "" }) => (
  <article className={`bg-white border border-[#e8eef2] rounded-2xl p-[26px_24px] transition-all duration-350 hover:shadow-hover ${className}`}>
    {children}
  </article>
);

export default function SystemHealth() {
  const { sysAlerts, status } = useSystemBehavior();

  const latest = sysAlerts[0];
  const cpu = Math.round(latest?.cpu_percent ?? 0);
  const memory = Math.round(latest?.memory_percent ?? 0);
  const processCount = latest?.process_count ?? 0;
  const networkConnections = latest?.network_connections ?? 0;

  const anomalyCount = sysAlerts.filter((s) => s.is_anomaly).length;
  const total = sysAlerts.length;
  const riskScore = total ? Math.round((anomalyCount / total) * 100) : 0;
  const riskTone = riskScore >= 50 ? "critical" : riskScore >= 20 ? "warning" : "safe";
  const riskLabel = riskScore >= 50 ? "Elevated anomaly rate" : riskScore >= 20 ? "Some anomalies detected" : "Nominal";

  // Chronological anomaly-score trend, normalized to a 0-100 display scale
  // (Isolation Forest decision_function scores are typically around -0.3..0.3)
  const trend = [...sysAlerts]
    .reverse()
    .slice(-20)
    .map((s) => Math.round(Math.min(1, Math.max(0, (s.anomaly_score + 0.3) / 0.6)) * 100));

  const recentEvents = sysAlerts.slice(0, 6);

  return (
    <div className="flex flex-col gap-7 font-sans">
      <PageHeader
        eyebrow="Layer 2 / Isolation Forest, unsupervised"
        title="System Behavioral Health"
        description="CPU, memory, process, and connection telemetry from this machine, scored against a learned baseline of normal behavior."
      >
        <div className="flex gap-3.5 items-center bg-white border border-[#e8eef2] px-3.5 py-2.5 rounded-lg font-sans text-[11px] text-[#8896a1]">
          <StatusBadge tone={status === "connected" ? "safe" : "warning"}>
            {status === "connected" ? "Monitor Online" : "Monitor Offline"}
          </StatusBadge>
          <span>{total} samples collected</span>
        </div>
      </PageHeader>

      {/* Risk banner - real, computed */}
      <div className={`flex flex-wrap justify-between items-center gap-5 bg-white border border-[#e8eef2] border-l-4 rounded-2xl p-[28px_26px] transition-all duration-350 ${riskTone === 'critical' ? 'border-l-red' : riskTone === 'warning' ? 'border-l-[#d88719]' : 'border-l-teal'}`}>
        <div>
          <StatusBadge tone={riskTone}>{riskLabel}</StatusBadge>
          <h2 className="text-[22px] font-extrabold text-ink my-2.5">
            System Anomaly Rate: <b className="text-red font-sans">{riskScore}</b>{" "}
            <small className="text-[#8896a1] text-[13px] font-normal">/ 100</small>
          </h2>
          <p className="m-0 text-muted text-[13px]">
            {total === 0
              ? "Waiting for the system behavior monitor to report telemetry."
              : `${anomalyCount} of the last ${total} samples deviated from this machine's learned baseline (Isolation Forest).`}
          </p>
        </div>
      </div>

      {/* Real gauges: CPU + Memory */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
        <Gauge label="CPU utilization" value={cpu} tone="critical" detail="Live reading from this machine, sampled every 5s." />
        <Gauge label="Committed RAM" value={memory} tone="warning" detail="Live memory usage from this machine." />
        <StatCard label="Active network connections" value={networkConnections} detail="Open sockets on this machine" icon="↔" />
        <StatCard label="Running processes" value={processCount} detail="Total OS processes observed" icon="⚙" />
      </div>

      {/* Baseline chart - real anomaly score trend */}
      <Panel>
        <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-ink m-0 mb-1">Normal Baseline vs Current Behavior</h2>
            <p className="text-[13px] text-[#8896a1] m-0">
              Isolation Forest anomaly score on the last {trend.length} system samples (higher = more deviation).
            </p>
          </div>
          <StatusBadge tone={status === "connected" ? "safe" : "warning"}>
            {status === "connected" ? "Observed real-time" : "No data available"}
          </StatusBadge>
        </div>
        {trend.length > 1 ? (
          <ConfidenceChart values={trend} label="Observed deviation" />
        ) : (
          <p className="text-[13px] text-muted py-10 text-center">Collecting baseline samples...</p>
        )}
      </Panel>

      {/* Real recent events, not a fabricated process table */}
      <Panel>
        <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-ink m-0 mb-1">Recent System Behavior Events</h2>
            <p className="text-[13px] text-[#8896a1] m-0">Most recent samples from the system monitor.</p>
          </div>
        </div>
        {recentEvents.length === 0 && (
          <p className="text-[13px] text-muted py-4">No samples yet — the background monitor collects one every 5 seconds once Flask is running.</p>
        )}
        {recentEvents.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr_1fr] gap-[15px] items-center py-4 border-t border-[#e8eef2] text-[13px] md:grid-cols-1 md:gap-2 md:py-3">
            <span className="font-sans text-xs text-muted">{new Date(s.time).toLocaleTimeString()}</span>
            <span className="text-ink">CPU {Math.round(s.cpu_percent)}% &middot; {s.process_count} processes &middot; {s.network_connections} connections</span>
            <StatusBadge tone={s.is_anomaly ? "critical" : "safe"}>
              {s.is_anomaly ? "Anomaly" : "Normal"}
            </StatusBadge>
          </div>
        ))}
      </Panel>
    </div>
  );
}
