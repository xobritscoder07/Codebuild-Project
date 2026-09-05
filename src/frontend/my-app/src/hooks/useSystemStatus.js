import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function useSystemStatus(intervalMs = 5000) {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("connecting");
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await api.getSystemStatusHistory(20);
        if (!active) return;
        const historyData = response?.data || [];
        setHistory(historyData);
        setData(historyData.length > 0 ? historyData[0] : null);
        setStatus("connected");
        setUpdatedAt(new Date());
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

  return { data, history, status, updatedAt };
}
