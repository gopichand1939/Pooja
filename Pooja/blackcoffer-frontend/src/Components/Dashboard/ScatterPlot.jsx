// src/Components/Dashboard/ScatterPlot.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
  Filler,
  Interaction,
} from "chart.js";
import PropTypes from "prop-types";
import Loader from "../Common/Loader";
import { fetchScatter } from "../../Services/api";
import debounce from "lodash.debounce";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title, Filler);

/* ---------------------------
   small utilities
----------------------------*/
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const relevanceToRadius = (rel) => {
  if (rel === null || rel === undefined) return 5;
  const r = Number(rel);
  if (Number.isNaN(r)) return 5;
  const scaled = 4 + (r / 10) * 16; // 4 -> 20
  return Math.round(clamp(scaled, 3, 22));
};

const colorForIntensity = (val, min = 0, max = 100) => {
  if (val === null || val === undefined || Number.isNaN(val))
    return "rgba(99,102,241,0.88)";
  const t = min === max ? 0.6 : clamp((Number(val) - min) / (max - min), 0, 1);
  const start = [79, 70, 229]; // #4f46e5
  const end = [236, 72, 153]; // #ec4899
  const r = Math.round(start[0] + (end[0] - start[0]) * t);
  const g = Math.round(start[1] + (end[1] - start[1]) * t);
  const b = Math.round(start[2] + (end[2] - start[2]) * t);
  return `rgba(${r},${g},${b},0.90)`;
};

/* Build Chart.js dataset and metadata from API rows.
   Accepts array of raw rows (API shape). Returns { datasets, meta }.
*/
const buildDataAndMeta = (rows = []) => {
  if (!Array.isArray(rows)) rows = [];
  let minI = Infinity,
    maxI = -Infinity;

  const pts = rows
    .map((r, idx) => {
      const intensity = r.intensity ?? r.avgIntensity ?? 0;
      const likelihood = r.likelihood ?? r.likelihood_score ?? 0;
      const relevance = r.relevance ?? r.relevance_score ?? 0;
      const label = r.label ?? r.topic ?? r.title ?? `E${idx + 1}`;

      const obj = {
        x: Number(likelihood),
        y: Number(intensity),
        r: relevanceToRadius(relevance),
        // keep raw metadata for tooltips / click handlers
        meta: {
          id: r._id ?? r.id ?? null,
          country: r.country ?? r.Country ?? "",
          topic: r.topic ?? r.label ?? "",
          relevance,
          raw: r,
        },
        label,
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

  const backgroundColors = pts.map((p) => colorForIntensity(p.y, minI, maxI));
  const borderColors = pts.map(() => "rgba(255,255,255,0.95)");

  const datasets = [
    {
      label: "Events",
      data: pts,
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 2,
      pointHoverBorderColor: "#fff",
      pointHoverBorderWidth: 3,
      showLine: false,
    },
  ];

  return { datasets, meta: { minIntensity: minI, maxIntensity: maxI, count: pts.length } };
};

/* ---------------------------
   ScatterPlot component
----------------------------*/
const ScatterPlot = ({ params = {}, onPointClick = null, height = 360 }) => {
  const [chartData, setChartData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // memoize fetch function and debounce to avoid rapid calls
  const doFetch = useCallback(
    async (p = {}) => {
      setLoading(true);
      setError(null);
      try {
        // fetchScatter returns the raw array (wrapper uses axios and returns res.data)
        const rows = await fetchScatter(p);
        const arr = Array.isArray(rows) ? rows : [];
        const built = buildDataAndMeta(arr);
        setChartData(built.datasets);
        setMeta(built.meta);
      } catch (err) {
        console.error("fetchScatter error:", err);
        setError("Failed to load scatter data");
        setChartData(null);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const debouncedFetch = useMemo(() => debounce(doFetch, 300), [doFetch]);

  useEffect(() => {
    debouncedFetch(params);
    return () => debouncedFetch.cancel();
  }, [debouncedFetch, JSON.stringify(params)]); 

  const chartJsData = useMemo(() => {
    if (!chartData) return { datasets: [] };
    return { datasets: chartData };
  }, [chartData]);

  const handleClick = (evt, elements) => {
    if (!elements || !elements.length) return;
    const el = elements[0];
    const datasetIndex = el.datasetIndex;
    const index = el.index;
    const ds = chartJsData.datasets?.[datasetIndex];
    const raw = ds?.data?.[index];
    if (onPointClick && raw && raw.meta) {
      onPointClick(raw.meta);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;
  if (!chartJsData.datasets.length || !chartJsData.datasets[0].data.length)
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
        usePointStyle: true,
        callbacks: {
          title: (items) => {
            const it = items?.[0];
            if (!it) return "";
            const raw = it.raw || {};
            return raw.label ?? `L:${it.parsed.x} I:${it.parsed.y}`;
          },
          label: (context) => {
            const raw = context.raw || {};
            const m = raw.meta || {};
            const parts = [];
            if (raw.x !== undefined) parts.push(`Likelihood: ${raw.x}`);
            if (raw.y !== undefined) parts.push(`Intensity: ${raw.y}`);
            if (m.relevance !== undefined) parts.push(`Relevance: ${m.relevance}`);
            if (m.country) parts.push(m.country);
            if (m.topic) parts.push(m.topic);
            return parts.join("  •  ");
          },
        },
        titleFont: { weight: "600" },
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
        hoverBorderWidth: 3,
      },
    },
    animation: { duration: 600, easing: "easeOutCubic" },
    onClick: handleClick,
  };

  return (
    <div style={{ width: "100%", height, padding: 8, boxSizing: "border-box" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >

        <div style={{ color: "#64748b", fontSize: 13 }}>
          {meta?.count ?? 0} points • Point size = relevance • color = intensity
        </div>
      </div>

      <div style={{ flex: "1 1 auto", width: "100%", height: `calc(${height}px - 48px)` }}>
        <Scatter data={chartJsData} options={options} />
      </div>
    </div>
  );
};

ScatterPlot.propTypes = {
  params: PropTypes.object,
  onPointClick: PropTypes.func,
  height: PropTypes.number,
};

ScatterPlot.defaultProps = {
  params: {},
  onPointClick: null,
  height: 360,
};

export default ScatterPlot;
