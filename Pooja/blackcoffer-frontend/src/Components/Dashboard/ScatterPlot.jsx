// src/Components/Dashboard/ScatterPlot.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";
import PropTypes from "prop-types";
import { getScatter } from "../../Services/api";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title, Filler);

/* helpers */

// clamp
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// convert relevance (0..10-ish) -> radius (px)
const relevanceToRadius = (rel) => {
  if (rel === null || rel === undefined) return 5;
  const r = Number(rel);
  if (Number.isNaN(r)) return 5;
  const scaled = 4 + (r / 10) * 16; // 4 -> 20
  return Math.round(clamp(scaled, 3, 22));
};

// color scale: lower intensity -> cool blue, higher -> warm purple/orange
const colorForIntensity = (val, min = 0, max = 100) => {
  if (val === null || val === undefined || Number.isNaN(val)) return "rgba(99,102,241,0.8)";
  const t = min === max ? 0.6 : clamp((Number(val) - min) / (max - min), 0, 1);
  // interpolate between blue and purple/orange-ish
  const start = [79, 70, 229]; // #4f46e5
  const end = [236, 72, 153]; // #ec4899 (pink-purple)
  const r = Math.round(start[0] + (end[0] - start[0]) * t);
  const g = Math.round(start[1] + (end[1] - start[1]) * t);
  const b = Math.round(start[2] + (end[2] - start[2]) * t);
  return `rgba(${r},${g},${b},0.88)`;
};

const buildDataAndMeta = (rows = []) => {
  if (!Array.isArray(rows)) rows = [];

  // compute min/max intensity for color scale
  let minI = Infinity, maxI = -Infinity;
  const pts = rows
    .map((r) => {
      const intensity = r.intensity ?? r.avgIntensity ?? 0;
      const likelihood = r.likelihood ?? 0;
      const relevance = r.relevance ?? 0;
      const obj = {
        x: Number(likelihood),
        y: Number(intensity),
        r: relevanceToRadius(relevance),
        meta: {
          id: r._id ?? null,
          country: r.country ?? r.Country ?? "",
          topic: r.topic ?? "",
          relevance,
        },
      };
      if (Number.isFinite(obj.y)) {
        minI = Math.min(minI, obj.y);
        maxI = Math.max(maxI, obj.y);
      }
      return obj;
    })
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

  if (minI === Infinity) minI = 0;
  if (maxI === -Infinity) maxI = 0;

  // build dataset where each point may have an individualized backgroundColor and borderColor
  const backgroundColors = pts.map((p) => colorForIntensity(p.y, minI, maxI));
  const borderColors = pts.map(() => "rgba(255,255,255,0.95)");

  return {
    datasets: [
      {
        label: "Events",
        data: pts,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
      },
    ],
    meta: { minIntensity: minI, maxIntensity: maxI },
  };
};

const ScatterPlot = ({ params = {} }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(
    async (p = {}) => {
      try {
        setLoading(true);
        setError(null);
        const res = await getScatter(p);
        const rows = Array.isArray(res.data) ? res.data : [];
        const built = buildDataAndMeta(rows);
        setChartData(built);
      } catch (err) {
        console.error("getScatter error:", err);
        setError("Failed to load scatter data");
        setChartData(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetch(params);
    const handler = (e) => {
      const detail = e?.detail ?? {};
      fetch(detail || {});
    };
    window.addEventListener("filtersChanged", handler);
    return () => window.removeEventListener("filtersChanged", handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch(params);
  }, [JSON.stringify(params)]); // shallow compare

  if (loading) return <div style={{ padding: 20 }}>Loading scatter…</div>;
  if (error) return <div style={{ padding: 20, color: "crimson" }}>{error}</div>;
  if (!chartData || !chartData.datasets || !chartData.datasets[0].data.length)
    return <div style={{ padding: 20 }}>No scatter points available.</div>;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        enabled: true,
        padding: 10,
        backgroundColor: "rgba(255,255,255,0.98)",
        titleColor: "#0f172a",
        bodyColor: "#0f172a",
        borderColor: "rgba(15,23,42,0.06)",
        borderWidth: 1,
        callbacks: {
          title: (items) => {
            if (!items || !items.length) return "";
            const item = items[0];
            return `Likelihood ${item.parsed.x} — Intensity ${item.parsed.y}`;
          },
          label: (context) => {
            const raw = context.raw || {};
            const meta = raw.meta || {};
            const parts = [];
            if (raw.x !== undefined) parts.push(`L: ${raw.x}`);
            if (raw.y !== undefined) parts.push(`I: ${raw.y}`);
            if (meta.relevance !== undefined) parts.push(`R: ${meta.relevance}`);
            if (meta.country) parts.push(meta.country);
            if (meta.topic) parts.push(meta.topic);
            return parts.join("  •  ");
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Likelihood", color: "#475569" },
        beginAtZero: true,
        ticks: { color: "#475569" },
        grid: { color: "rgba(15,23,42,0.04)" },
      },
      y: {
        title: { display: true, text: "Intensity", color: "#475569" },
        beginAtZero: true,
        ticks: { color: "#475569" },
        grid: { color: "rgba(15,23,42,0.04)" },
      },
    },
    interaction: { mode: "nearest", intersect: true },
    elements: {
      point: {
        // Chart reads per-point radius `r` from data objects
        hoverBorderWidth: 3,
      },
    },
    animation: { duration: 600, easing: "easeOutCubic" },
    // improve accessibility: show focus outline when keyboard navigating (handled by chart lib + tabIndex on elements)
  };

  // container header + subtitle
  return (
    <div style={{ width: "100%", height: 360, padding: 8, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Scatter (intensity vs Likelihood)</h4>
        <div style={{ color: "#64748b", fontSize: 13 }}>Point size = relevance, color = intensity</div>
      </div>

      <div style={{ flex: "1 1 auto", width: "100%", height: "calc(100% - 36px)" }}>
        <Scatter data={chartData.datasets[0] ? { datasets: chartData.datasets } : { datasets: [] }} options={options} />
      </div>
    </div>
  );
};

ScatterPlot.propTypes = {
  params: PropTypes.object,
};

export default ScatterPlot;
