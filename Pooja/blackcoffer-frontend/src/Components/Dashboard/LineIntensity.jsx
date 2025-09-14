// src/Components/Dashboard/LineIntensity.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import PropTypes from "prop-types";
import { getIntensityByYear } from "../../Services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * normalize dataset returned by API into labels + dataset + meta
 */
const buildChartData = (rows = []) => {
  const normalized = rows
    .map((r) => {
      const year = r.year ?? r._id ?? null;
      const avg = r.avgIntensity ?? r.intensity ?? 0;
      const count = r.count ?? 0;
      return {
        year: year === null ? null : Number(year),
        avg: Number(avg || 0),
        count: Number(count || 0),
      };
    })
    .filter((r) => r.year !== null && !Number.isNaN(r.year));

  normalized.sort((a, b) => a.year - b.year);

  return {
    labels: normalized.map((r) => String(r.year)),
    datasets: [
      {
        label: "Avg Intensity",
        data: normalized.map((r) => r.avg),
        // borderColor left as color; the area fill is provided scriptably below
        borderColor: "#4f46e5",
        tension: 0.35,
        cubicInterpolationMode: "monotone",
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#4f46e5",
        pointBorderWidth: 2,
        hitRadius: 12,
        hoverBorderWidth: 3,
        fill: "start",
      },
    ],
    _meta: normalized.map((r) => ({ year: r.year, count: r.count })),
  };
};

const LineIntensity = ({ params = {} }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(
    async (p = {}) => {
      try {
        setLoading(true);
        setError(null);
        const res = await getIntensityByYear(p);
        const rows = Array.isArray(res.data) ? res.data : [];
        const built = buildChartData(rows);
        setChartData(built);
      } catch (err) {
        console.error("getIntensityByYear error:", err);
        setChartData(null);
        setError("Failed to load intensity data");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // initial fetch
    fetch(params);

    // legacy filter event listener
    const handler = (e) => {
      const detail = e?.detail ?? {};
      fetch(detail || {});
    };

    window.addEventListener("filtersChanged", handler);
    return () => window.removeEventListener("filtersChanged", handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // refetch when params change
  useEffect(() => {
    fetch(params);
  }, [JSON.stringify(params)]); // shallow compare

  if (loading) return <div style={{ padding: 18 }}>Loading intensity…</div>;
  if (error) return <div style={{ padding: 18, color: "crimson" }}>{error}</div>;
  if (!chartData || !chartData.labels.length) return <div style={{ padding: 18 }}>No data</div>;

  // Chart.js options with scriptable backgroundColor for proper gradient
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 12, right: 18, bottom: 6, left: 6 } },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "rectRounded",
          padding: 12,
          boxWidth: 14,
          boxHeight: 8,
          color: "#0f172a",
          font: { size: 13, weight: "600" },
        },
      },
      title: { display: false },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        padding: 10,
        backgroundColor: "rgba(255,255,255,0.98)",
        titleColor: "#0f172a",
        bodyColor: "#0f172a",
        borderColor: "rgba(15,23,42,0.06)",
        borderWidth: 1,
        callbacks: {
          title: (items) => {
            if (!items || !items.length) return "";
            return `Year: ${items[0].label}`;
          },
          label: (context) => {
            const label = context.dataset.label || "Value";
            const value = context.parsed.y;
            const idx = context.dataIndex;
            const meta = chartData._meta && chartData._meta[idx];
            const count = meta ? meta.count : null;
            const valueStr = typeof value === "number" ? value.toFixed(2) : value;
            return `${label}: ${valueStr}${count !== null ? ` (count: ${count})` : ""}`;
          },
        },
      },
    },
    interaction: { mode: "index", intersect: false },
    elements: {
      line: {
        borderJoinStyle: "round",
      },
      point: {
        hoverRadius: 8,
        radius: 5,
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Year", color: "#475569", font: { size: 13 } },
        ticks: { color: "#475569", maxRotation: 0, autoSkip: true },
        grid: { display: false },
      },
      y: {
        title: { display: true, text: "Avg Intensity", color: "#475569", font: { size: 13 } },
        ticks: { color: "#475569" },
        grid: {
          color: "rgba(15,23,42,0.04)",
          borderDash: [4, 4],
        },
        beginAtZero: true,
      },
    },
    animation: { duration: 700, easing: "easeOutQuart" },
    // add subtle hover glow by changing border width on hover via plugin-like scriptable options
  };

  // We use Chart.js scriptable option to supply a dynamic gradient that scales with chart area.
  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets.map((ds, idx) => ({
      ...ds,
      // scriptable background that draws a vertical gradient based on chart area
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) {
          // chart not yet ready -> fallback translucent fill
          return "rgba(37,99,235,0.12)";
        }
        const top = chartArea.top;
        const bottom = chartArea.bottom;
        const gradient = ctx.createLinearGradient(0, top, 0, bottom);
        // gradient stops (soft blue -> transparent)
        gradient.addColorStop(0, "rgba(99,102,241,0.28)");
        gradient.addColorStop(0.35, "rgba(99,102,241,0.16)");
        gradient.addColorStop(1, "rgba(99,102,241,0.03)");
        return gradient;
      },
      borderColor: "#4f46e5",
      pointBackgroundColor: "#ffffff",
      pointBorderColor: "#4f46e5",
      pointHoverBackgroundColor: "#4f46e5",
    })),
  };

  // container with responsive height so chart looks balanced
  return (
    <div style={{
      width: "100%",
      height: 380,
      padding: 12,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: 8
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Intensity by Year</h4>
        <div style={{ color: "#64748b", fontSize: 13 }}>Avg intensity trend</div>
      </div>

      <div style={{ flex: "1 1 auto", minHeight: 260 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

LineIntensity.propTypes = {
  params: PropTypes.object,
};

export default LineIntensity;
