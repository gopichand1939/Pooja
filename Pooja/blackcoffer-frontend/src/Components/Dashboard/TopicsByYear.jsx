// src/Components/Dashboard/TopicsByYear.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import PropTypes from "prop-types";
import { getTopicsByYear } from "../../Services/api";
import { useSelector } from "react-redux";
import { selectFilters } from "../../Redux/slices/filtersSlice";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler);

/* — palette (soft but distinct) — */
const PALETTE = [
  "#6d28d9",
  "#7c3aed",
  "#4f46e5",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#00a3ff",
  "#7dd3fc"
];

const colorForIndex = (i, alpha = 1) => {
  const c = PALETTE[i % PALETTE.length];
  if (alpha === 1) return c;
  // convert hex -> rgba
  const bigint = parseInt(c.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

function compactParams(obj = {}) {
  const out = {};
  Object.keys(obj).forEach((k) => {
    if (k === "lastUpdated") return;
    const v = obj[k];
    if (v === undefined || v === null) return;
    if (typeof v === "string" && v.trim() === "") return;
    if (Array.isArray(v) && v.length === 0) return;
    out[k] = v;
  });
  return out;
}

/**
 * rows: expected shape [{ year, topic, count }, ...]
 * Build stacked datasets showing topN topics (by total count)
 */
function buildStackedData(rows = [], topNTopics = 12) {
  if (!rows || !rows.length) return { labels: [], datasets: [], totals: {} };

  const yearSet = new Set();
  const topicTotals = {};
  rows.forEach((r) => {
    const y = r.year ?? r._id?.year ?? null;
    const t = r.topic ?? r._id?.topic ?? "Unknown";
    const c = Number(r.count ?? 0);
    if (y !== null && y !== undefined) yearSet.add(Number(y));
    topicTotals[t] = (topicTotals[t] || 0) + (Number.isFinite(c) ? c : 0);
  });

  const years = Array.from(yearSet).sort((a, b) => a - b).map(String);
  const topicsSorted = Object.keys(topicTotals).sort((a, b) => topicTotals[b] - topicTotals[a]);
  const chosenTopics = topicsSorted.slice(0, topNTopics);

  // create lookup map topic::year -> value
  const lookup = {};
  rows.forEach((r) => {
    const y = String(r.year ?? r._id?.year ?? "");
    const t = String(r.topic ?? r._id?.topic ?? "Unknown");
    const c = Number(r.count ?? 0);
    lookup[`${t}::${y}`] = (lookup[`${t}::${y}`] || 0) + (Number.isFinite(c) ? c : 0);
  });

  const datasets = chosenTopics.map((t, idx) => ({
    label: t,
    data: years.map((y) => lookup[`${t}::${y}`] || 0),
    backgroundColor: colorForIndex(idx, 0.95),
    borderColor: colorForIndex(idx, 1),
    borderWidth: 1,
    borderRadius: 6,
    barThickness: 26,
    stack: "topics",
  }));

  return { labels: years, datasets, chosenTopics, totals: topicTotals };
}

const TopicsByYear = ({ params = {}, topNTopics = 12 }) => {
  const reduxFilters = useSelector(selectFilters);
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // merge redux filters + props (props override)
  const merged = useMemo(() => ({ ...(reduxFilters || {}), ...(params || {}) }), [reduxFilters, params]);
  const effectiveParams = useMemo(() => compactParams(merged), [merged]);

  const fetchData = useCallback(
    async (p) => {
      try {
        setLoading(true);
        setError(null);
        const res = await getTopicsByYear(p);
        const data = Array.isArray(res.data) ? res.data : [];
        setRows(data);
      } catch (err) {
        console.error("getTopicsByYear error:", err);
        setRows(null);
        setError("Failed to load topics by year");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(effectiveParams);
    const handler = (e) => {
      const detail = compactParams(e?.detail ?? {});
      const combined = { ...effectiveParams, ...(detail || {}) };
      fetchData(combined);
    };
    window.addEventListener("filtersChanged", handler);
    return () => window.removeEventListener("filtersChanged", handler);
  }, [fetchData, JSON.stringify(effectiveParams)]);

  if (loading) return <div style={{ padding: 18 }}>Loading topics by year…</div>;
  if (error) return <div style={{ padding: 18, color: "crimson" }}>{error}</div>;
  if (!rows || !rows.length) return <div style={{ padding: 18 }}>No topic/year data available.</div>;

  const { labels, datasets, chosenTopics, totals } = buildStackedData(rows, topNTopics);

  // compute legend labels that show count summary for top topics
  const legendLabels = chosenTopics.map((t, i) => ({
    text: `${t}`,
    fillStyle: colorForIndex(i, 0.95),
    strokeStyle: colorForIndex(i, 1),
    hidden: false,
    datasetIndex: i,
  }));

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700, easing: "easeOutCubic" },
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 14,
          boxHeight: 14,
          padding: 10,
          usePointStyle: false,
          font: { size: 13, weight: "600" },
        },
        // show only topN in legend
        onClick: (e, legendItem, legend) => {
          // toggle dataset visibility
          const ci = legend.chart;
          const idx = legendItem.datasetIndex;
          const meta = ci.getDatasetMeta(idx);
          meta.hidden = meta.hidden === null ? !ci.data.datasets[idx].hidden : null ? !meta.hidden : !meta.hidden;
          ci.update();
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        padding: 10,
        bodyFont: { size: 13, weight: "600" },
        callbacks: {
          // title shows Year
          title: (items) => {
            if (!items || !items.length) return "";
            return `Year: ${items[0].label}`;
          },
          // label shows topic: value (and total)
          label: (context) => {
            const datasetLabel = context.dataset.label || "";
            const value = context.parsed.y !== undefined ? context.parsed.y : context.raw;
            const total = totals[datasetLabel] ?? null;
            const totalText = total !== null ? ` (total: ${total})` : "";
            return `${datasetLabel}: ${value}${totalText}`;
          },
        },
        // nicer background / border
        backgroundColor: "rgba(255,255,255,0.98)",
        titleColor: "#0f172a",
        bodyColor: "#0f172a",
        borderColor: "rgba(15,23,42,0.06)",
        borderWidth: 1,
      },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: "Year",
          color: "#475569",
          font: { size: 13 },
        },
        ticks: { color: "#475569", maxRotation: 0, autoSkip: true },
        grid: { display: false },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
          color: "#475569",
          font: { size: 13 },
        },
        ticks: { color: "#475569" },
        grid: {
          color: "rgba(15,23,42,0.04)",
          borderDash: [4, 4],
        },
      },
    },
    // highlight effect on hover
    onHover: (evt, chartElements) => {
      // change cursor when over a bar
      const el = chartElements && chartElements.length;
      evt.native.target.style.cursor = el ? "pointer" : "default";
    },
  };

  // final data object (apply a softer background variant for stacked fill)
  const data = {
    labels,
    datasets: datasets.map((d, idx) => ({
      ...d,
      backgroundColor: colorForIndex(idx, 0.92),
      borderColor: colorForIndex(idx, 1),
      borderWidth: 1,
      /* add subtle gradient-ish feel by layering a slightly more transparent color for fill (ChartJS will use backgroundColor) */
    })),
  };

  return (
    <div style={{
      width: "100%",
      height: 460,
      padding: 8,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
        <h4 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Topics by Year</h4>
        <div style={{ fontSize: 13, color: "#64748b" }}>
          Top {chosenTopics.length} topics • stacked
        </div>
      </div>

      <div style={{ flex: "1 1 auto", minHeight: 320 }}>
        <Bar data={data} options={options} />
      </div>

      {/* small legend summary cards beneath the chart for quick counts */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        {chosenTopics.map((t, i) => (
          <div key={t} style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            background: "white",
            borderRadius: 10,
            padding: "8px 12px",
            boxShadow: "0 6px 18px rgba(2,6,23,0.04)",
            minWidth: 140
          }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: 4,
              background: colorForIndex(i, 0.95),
              border: `2px solid ${colorForIndex(i, 1)}`
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{t}</div>
              <div style={{ color: "#64748b", fontSize: 12 }}>{(totals[t] ?? 0)} events</div>
            </div>
          </div>
        ))}

        {/* show hint if there are more topics not displayed */}
        {Object.keys(totals).length > chosenTopics.length && (
          <div style={{
            alignSelf: "center",
            color: "#475569",
            fontSize: 13,
            marginLeft: 6
          }}>
            +{Object.keys(totals).length - chosenTopics.length} more topics
          </div>
        )}
      </div>
    </div>
  );
};

TopicsByYear.propTypes = {
  params: PropTypes.object,
  topNTopics: PropTypes.number,
};

export default TopicsByYear;
