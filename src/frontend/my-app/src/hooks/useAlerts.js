import { useEffect, useRef, useState } from "react";
import { api } from "../services/api";

export default function useAlerts(intervalMs = 2000) {
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState("connecting");
  const [updatedAt, setUpdatedAt] = useState(null);
  const previousCount = useRef(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await api.getAlerts();
        if (!active) return;
        setAlerts(Array.isArray(data) ? data : []);
        setStatus("connected");
        setUpdatedAt(new Date());
        previousCount.current = Array.isArray(data)
          ? data.length
          : previousCount.current;
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

  return { alerts, status, updatedAt, hasNewData: previousCount.current > 0 };
}
