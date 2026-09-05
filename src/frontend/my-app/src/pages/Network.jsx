import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import ConfidenceChart from "../components/charts/ConfidenceChart";
import useAlerts from "../hooks/useAlerts";

/* Shared button */
const Btn = ({ children, variant = 'secondary', onClick, className = "" }) => {
  const base = "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold font-sans cursor-pointer no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,.1)]";
  const variants = {
    primary: "bg-teal border-2 border-teal-dark text-white",
    secondary: "bg-white border-[1.5px] border-[#d6e0e4] text-ink hover:border-teal hover:text-teal-dark",
  };
  const merged = `${base} ${variants[variant]} ${className}`;
  return <button className={merged} onClick={onClick}>{children}</button>;
};

const Panel = ({ children, className = "" }) => (
  <article className={`bg-white border border-[#e8eef2] rounded-2xl p-[26px_24px] transition-all duration-350 hover:shadow-hover ${className}`}>
    {children}
  </article>
);

export default function Network() {
  const [showAllFlows, setShowAllFlows] = useState(false);
  const { alerts, status } = useAlerts();

  const totalFlows = alerts.length;
  const attacks = alerts.filter((alert) => alert.is_attack).length;
  const normal = totalFlows - attacks;
  const attackRate = totalFlows ? Math.round((attacks / totalFlows) * 100) : 0;

  const confidence = alerts
    .slice(0, 20)
    .reverse()
    .map((alert) => Math.round((alert.confidence || 0) * 100));

  return (
    <div className="flex flex-col gap-7 font-sans">
      <PageHeader
        eyebrow="Layer 1 / LightGBM flow classifier"
        title="Network Intelligence"
        description="Behavioral analysis of network flow timing patterns — not signature matching."
      />

      {/* Stats grid — only metrics we actually compute */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
        <StatCard label="Total flows analyzed" value={totalFlows} detail="Live count from /alerts" icon="↔" />
        <StatCard label="Attacks flagged" value={attacks} detail="Classified by LightGBM" tone="critical" icon="!" />
        <StatCard label="Normal flows" value={normal} detail="Below attack threshold" tone="safe" icon="✓" />
        <StatCard label="Attack rate" value={`${attackRate}%`} detail="Of analyzed flows" tone={attackRate >= 50 ? "critical" : "warning"} icon="↗" />
      </div>

      {/* Chart */}
      <Panel>
        <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-ink m-0 mb-1">Attack Confidence - Live Trend</h2>
            <p className="text-[13px] text-[#8896a1] m-0">LightGBM confidence score on the last {confidence.length} flows.</p>
          </div>
          <StatusBadge tone={status === "connected" ? "safe" : "warning"}>
            {status === "connected" ? "Streaming telemetry" : "Reconnecting..."}
          </StatusBadge>
        </div>
        {confidence.length > 1 ? (
          <ConfidenceChart values={confidence} label="Attack confidence" />
        ) : (
          <p className="text-[13px] text-muted py-10 text-center">Waiting for enough flow data to chart a trend...</p>
        )}
      </Panel>

      {/* Table */}
      <Panel>
        <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-ink m-0 mb-1">Network Flow Log</h2>
            <p className="text-[13px] text-[#8896a1] m-0">
              Real-time flow metadata and classifier verdicts.
            </p>
          </div>
          <Btn onClick={() => setShowAllFlows((c) => !c)}>
            {showAllFlows ? "Show Recent" : `Show All Flows (${alerts.length})`}
          </Btn>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr>
                {["Time", "Source IP", "Destination IP", "Port", "Confidence", "Verdict"].map(h => (
                  <th key={h} className="text-center py-3 px-2.5 border-b-2 border-[#e8eef2] font-sans text-xs font-bold tracking-[0.06em] uppercase text-[#8896a1] bg-[#fafcfd]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.length ? (
                (showAllFlows ? alerts : alerts.slice(0, 8)).map((alert, index) => (
                  <tr key={`${alert.time}-${index}`} className="transition-colors duration-200 hover:bg-[#f8fcfb]">
                    <td className="py-3.5 px-2.5 text-center text-xs font-sans border-b border-[#e8eef2]">
                      {new Date(alert.time).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-2.5 text-center text-xs font-sans border-b border-[#e8eef2]">{alert.src_ip}</td>
                    <td className="py-3.5 px-2.5 text-center text-xs font-sans border-b border-[#e8eef2]">{alert.dst_ip}</td>
                    <td className="py-3.5 px-2.5 text-center text-xs font-sans border-b border-[#e8eef2]">{alert.dst_port}</td>
                    <td className="py-3.5 px-2.5 text-center text-xs border-b border-[#e8eef2]">{Math.round((alert.confidence || 0) * 100)}%</td>
                    <td className="py-3.5 px-2.5 text-center border-b border-[#e8eef2]">
                      <StatusBadge tone={alert.is_attack ? "critical" : "safe"}>
                        {alert.is_attack ? "Attack" : "Normal"}
                      </StatusBadge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-[#8896a1] text-[13px] border-b border-[#e8eef2]">
                    {status === "disconnected"
                      ? "API disconnected - start the Flask service to stream flows."
                      : "Waiting for traffic data..."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
