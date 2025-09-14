import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { getByCountry } from "../../Services/api";
import "../../styles/dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);



const formatLabel = (c) => (c === null || c === "" ? "Unknown" : c);

const buildChartData = (rows = [], topN = 10) => {
  const sorted = [...rows].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, topN);
  const labels = sorted.map((r) => formatLabel(r.country));
  const values = sorted.map((r) => r.count || 0);
  return {
    labels,
    datasets: [
      {
        label: "Count",
        data: values,
        backgroundColor: "rgba(59,130,246,0.95)",
        borderRadius: 8,
        barThickness: 18,
        maxBarThickness: 28,
      },
    ],
  };
};

const CountryList = ({ rows = [], topN = 10 }) => {
  const sorted = [...rows].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, topN);
  const maxCount = sorted.length ? Math.max(...sorted.map((r) => r.count || 0)) : 1;

  return (
    <div className="bc-country-list" style={{ padding: 12 }}>
      {sorted.map((r, i) => {
        const country = formatLabel(r.country);
        const count = r.count || 0;
        const pct = maxCount ? Math.round((count / maxCount) * 100) : 0;
        return (
          <div key={`${country}-${i}`} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 14 }}>{country}</div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 14, background: "#f3f4f6", borderRadius: 12, overflow: "hidden" }}>
                <div style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: "linear-gradient(90deg,#6366f1 0%, #3b82f6 100%)",
                }} />
              </div>
            </div>
            <div style={{ width: 56, textAlign: "right", fontWeight: 700 }}>{count}</div>
          </div>
        );
      })}
    </div>
  );
};

const CountryBars = ({ params = {}, topN = 10, variant = "chart" }) => {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (p = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getByCountry(p);
      const data = Array.isArray(res.data) ? res.data : [];
      setRows(data);
    } catch (err) {
      console.error("getByCountry error:", err);
      setRows(null);
      setError("Failed to load country data");
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, [JSON.stringify(params)]);

  if (loading) return <div style={{ padding: 16 }}>Loading countries…</div>;
  if (error) return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;
  if (!rows || !rows.length) return <div style={{ padding: 16 }}>No country data available.</div>;

  if (variant === "list") {
    return <CountryList rows={rows} topN={topN} />;
  }

  const chartData = buildChartData(rows, topN);

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 8, right: 8, top: 4, bottom: 4 } },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const idx = context.dataIndex;
            const label = context.label;
            const count = context.dataset.data[idx];
            const match = rows.find((r) => formatLabel(r.country) === label);
            const avg = match ? match.avgIntensity : null;
            return `${label}: ${count}${avg !== null ? ` • avg intensity: ${Number(avg).toFixed(2)}` : ""}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Count" },
        beginAtZero: true,
        grid: { color: "rgba(15,23,42,0.04)" },
        ticks: { precision: 0 },
      },
      y: {
        title: { display: false },
        ticks: { autoSkip: false, maxRotation: 0 },
        grid: { display: false },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: 360, padding: 8 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

CountryBars.propTypes = {
  params: PropTypes.object,
  topN: PropTypes.number,
  variant: PropTypes.oneOf(["chart", "list"]),
};

export default CountryBars;
