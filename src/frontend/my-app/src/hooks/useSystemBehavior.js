import { useEffect, useState } from "react";
import { API_URL } from "../services/api";

// Polls our Isolation Forest system-behavior endpoints (not the raw
// SQLite /system-status endpoint, which has no ML verdict).
export default function useSystemBehavior(intervalMs = 5000) {
  const [sysAlerts, setSysAlerts] = useState([]);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/system-behavior-alerts`);
        const data = await res.json();
        if (!active) return;
        setSysAlerts(Array.isArray(data) ? data : []);
        setStatus("connected");
      } catch {
        if (active) setStatus("disconnected");
      }
    };
    load();
    const timer = window.setInterval(load, intervalMs);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [intervalMs]);

  return { sysAlerts, status };
}
