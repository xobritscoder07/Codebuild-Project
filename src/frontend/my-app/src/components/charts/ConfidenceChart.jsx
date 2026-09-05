import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

export default function ConfidenceChart({
  values = [],
  label = "Attack confidence",
}) {
  const points = values.length ? values : [20, 25, 22, 34, 31, 49, 44];
  
  const data = {
    labels: points.map((_, i) => `T+${i}`), // Labels for x-axis
    datasets: [
      {
        label: label,
        data: points,
        borderColor: "#0e9f92",
        backgroundColor: "rgba(14,159,146,0.1)",
        borderWidth: 2.5,
        fill: true,
        pointStyle: 'circle',
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#0e9f92",
        pointBorderWidth: 2,
        tension: 0, // Straight lines like the original
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(20, 43, 58, 0.9)",
        titleFont: { family: "'IBM Plex Mono', monospace", size: 11 },
        bodyFont: { family: "'IBM Plex Mono', monospace", size: 12 },
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        display: false, // hide x axis completely
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          display: false, // hide labels
        },
        grid: {
          color: (ctx) => {
            if (ctx.tick.value === 50) return "rgba(217,79,92,0.6)"; // critical threshold line
            return "#e0e8ec";
          },
          lineWidth: (ctx) => {
            if (ctx.tick.value === 50) return 1.5;
            return 0.5;
          },
          borderDash: (ctx) => {
            if (ctx.tick.value === 50) return [4, 3];
            return [];
          },
          drawBorder: false,
        },
      },
    },
  };

  return (
    <div style={{ minHeight: 270, padding: '4px 2px 0', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 18,
        fontFamily: "'Barlow', sans-serif",
        fontSize: 10, color: '#8896a1',
        marginBottom: 8,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <i style={{ display: 'inline-block', width: 18, height: 3, background: '#0e9f92', borderRadius: 2 }} />
          {label}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <i style={{ display: 'inline-block', width: 18, height: 3, background: '#d94f5c', borderRadius: 2 }} />
          50% critical threshold
        </span>
      </div>
      
      <div style={{ flex: 1, minHeight: 185, position: 'relative' }}>
        {/* Background for critical zone (above 50) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '50%',
          backgroundColor: 'rgba(217,79,92,.04)',
          pointerEvents: 'none'
        }} />
        <Line data={data} options={options} />
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        paddingTop: 10,
        fontFamily: "'Barlow', sans-serif",
        fontSize: 10, color: '#8896a1',
      }}>
        <span>14:35 UTC</span>
        <span>14:42 UTC</span>
        <span>14:50 UTC</span>
        <span>LIVE WINDOW</span>
      </div>
    </div>
  );
}
