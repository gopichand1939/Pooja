// src/Components/Dashboard/CityYearHeatmap.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { getCityYearHeatmap } from "../../Services/api";

/**
 * Bigger, teal-themed CityYearHeatmap
 * - larger default cellSize for more prominent boxes
 * - teal/blue color ramp
 * - centered and responsive
 */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** interpolate two RGB arrays */
const lerp = (a, b, t) => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

/** convert hex color to RGB array */
const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map(c=>c+c).join("") : h, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

/**
 * New teal theme:
 * light: #eef7fb (very pale)
 * mid:   #9fe3f2
 * deep:  #008299
 */
function colorForValue(v, min, max) {
  if (v === null || v === undefined || Number.isNaN(v)) return "#f3f4f6";
  if (max === min) return "#008299";
  const t = clamp((v - min) / (max - min), 0, 1);

  const cLight = hexToRgb("#eef7fb"); // pale blue
  const cMid = hexToRgb("#9fe3f2"); // mid cyan
  const cDeep = hexToRgb("#008299"); // deep teal

  // use a two-stage interpolation (light -> mid -> deep)
  if (t < 0.5) {
    const sub = t / 0.5;
    const rgb = lerp(cLight, cMid, sub);
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  } else {
    const sub = (t - 0.5) / 0.5;
    const rgb = lerp(cMid, cDeep, sub);
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  }
}

/** tooltip rendered via foreignObject for nicer styling */
const ToolTip = ({ x, y, children }) => (
  <foreignObject x={x} y={y} width={300} height={84} style={{ pointerEvents: "none" }}>
    <div xmlns="http://www.w3.org/1999/xhtml" style={{
      background: "white",
      border: "1px solid rgba(0,0,0,0.08)",
      padding: 10,
      borderRadius: 8,
      boxShadow: "0 8px 20px rgba(2,6,23,0.06)",
      fontSize: 13,
      color: "#0f172a"
    }}>
      {children}
    </div>
  </foreignObject>
);

const CityYearHeatmap = ({
  params = {},
  metricLabel = "Value",
  cellSize = 88,        // increased default cell size for bigger boxes
  lastNYears = 8,
  topNCities = 6,
  maxSvgWidth = 1200
}) => {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hover, setHover] = useState(null);

  const fetch = useCallback(
    async (p = {}) => {
      try {
        setLoading(true);
        setError(null);
        const res = await getCityYearHeatmap(p);
        const data = Array.isArray(res.data) ? res.data : [];
        setRows(data);
      } catch (err) {
        console.error("getCityYearHeatmap error:", err);
        setRows(null);
        setError("Failed to load heatmap data");
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
  }, [JSON.stringify(params)]);

  const matrix = useMemo(() => {
    if (!rows || !rows.length) return null;

    const allYears = Array.from(new Set(rows.map((r) => Number(r.year)).filter((y) => !Number.isNaN(y)))).sort((a, b) => a - b);
    const years = allYears.length <= lastNYears ? allYears : allYears.slice(-lastNYears);

    const cityTotals = rows.reduce((acc, r) => {
      const city = r.city || "Unknown";
      const v = r.value === undefined ? (r.count ?? r.avgIntensity ?? 0) : r.value;
      const num = Number(v === "" ? 0 : v) || 0;
      acc[city] = (acc[city] || 0) + num;
      return acc;
    }, {});
    const sortedCities = Object.keys(cityTotals).sort((a, b) => cityTotals[b] - cityTotals[a]);
    const cities = sortedCities.length <= topNCities ? sortedCities : sortedCities.slice(0, topNCities);
    if (cities.length === 0) cities.push("Unknown");

    const map = new Map();
    let min = Infinity, max = -Infinity;
    rows.forEach((r) => {
      const city = r.city || "Unknown";
      const year = Number(r.year);
      if (!years.includes(year)) return;
      if (!cities.includes(city)) return;
      const v = r.value === undefined ? (r.count ?? r.avgIntensity ?? 0) : r.value;
      const num = v === "" || v === null || v === undefined ? null : Number(v);
      const key = `${city}::${year}`;
      map.set(key, num);
      if (num !== null && !Number.isNaN(num)) {
        min = Math.min(min, num);
        max = Math.max(max, num);
      }
    });

    if (min === Infinity) min = 0;
    if (max === -Infinity) max = 0;

    const grid = cities.map((city) => years.map((yr) => {
      const key = `${city}::${yr}`;
      const val = map.has(key) ? map.get(key) : null;
      return { city, year: yr, value: val };
    }));

    return { years, cities, grid, min, max, cityTotals };
  }, [rows, lastNYears, topNCities]);

  if (loading) return <div style={{ padding: 18 }}>Loading heatmap…</div>;
  if (error) return <div style={{ padding: 18, color: "crimson" }}>{error}</div>;
  if (!matrix) return <div style={{ padding: 18 }}>No heatmap data available.</div>;

  const { years, cities, grid, min, max } = matrix;

  // compute width/height and scale if necessary
  const leftLabelWidth = 180;
  const topLabelHeight = 36;
  let width = leftLabelWidth + years.length * cellSize + 36;
  if (width > maxSvgWidth) {
    const available = maxSvgWidth - leftLabelWidth - 36;
    const scaledCell = Math.max(28, Math.floor(available / years.length));
    width = leftLabelWidth + years.length * scaledCell + 36;
  }
  const usedCellSize = (width - leftLabelWidth - 36) / years.length;
  const height = topLabelHeight + cities.length * usedCellSize + 100;

  const onCellEnter = (evt, cell) => {
    const rect = evt.currentTarget.getBoundingClientRect();
    const svg = evt.currentTarget.ownerSVGElement;
    const svgRect = svg.getBoundingClientRect();
    const px = rect.x - svgRect.x + 8;
    const py = rect.y - svgRect.y - 48;
    setHover({ ...cell, px, py });
  };
  const onCellLeave = () => setHover(null);

  return (
    <div style={{
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 18,
      boxSizing: "border-box"
    }}>
      <div style={{ maxWidth: "100%", width: Math.min(width, maxSvgWidth), boxSizing: "border-box" }}>
        <svg width={Math.min(width, maxSvgWidth)} height={height} role="img" aria-label="City Year Heatmap" style={{ display: "block", margin: "0 auto" }}>
          {/* Year labels */}
          <g transform={`translate(${leftLabelWidth}, ${topLabelHeight - 10})`}>
            {years.map((y, i) => {
              const x = i * usedCellSize + usedCellSize / 2;
              return (
                <text key={y} x={x} y={-10} textAnchor="middle" fontSize={14} fill="#0f172a" style={{ fontWeight: 700 }}>
                  {y}
                </text>
              );
            })}
          </g>

          {/* City labels */}
          <g transform={`translate(${12}, ${topLabelHeight})`}>
            {cities.map((c, i) => {
              const y = i * usedCellSize + usedCellSize / 2 + 6;
              return (
                <text key={c} x={0} y={y} fontSize={15} fill="#09142a" style={{ fontWeight: 800 }}>
                  {c.length > 20 ? `${c.slice(0, 18)}…` : c}
                </text>
              );
            })}
          </g>

          {/* Grid */}
          <g transform={`translate(${leftLabelWidth}, ${topLabelHeight})`}>
            {grid.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const x = cIdx * usedCellSize;
                const y = rIdx * usedCellSize;
                const color = colorForValue(cell.value, min, max);
                return (
                  <g key={`${cell.city}-${cell.year}`} transform={`translate(${x}, ${y})`}>
                    <rect
                      x={0}
                      y={0}
                      width={usedCellSize - 10}
                      height={usedCellSize - 10}
                      rx={10}
                      ry={10}
                      fill={color}
                      stroke={cell.value === null ? "transparent" : "rgba(0,0,0,0.06)"}
                      onMouseEnter={(e) => onCellEnter(e, cell)}
                      onMouseMove={(e) => onCellEnter(e, cell)}
                      onMouseLeave={onCellLeave}
                      role="button"
                      tabIndex={0}
                      onFocus={(e) => onCellEnter(e, cell)}
                      onBlur={onCellLeave}
                      aria-label={`${cell.city} ${cell.year} ${metricLabel} ${cell.value === null ? "N/A" : cell.value}`}
                    />
                  </g>
                );
              })
            )}
          </g>

          {/* Legend */}
          <g transform={`translate(${leftLabelWidth}, ${topLabelHeight + cities.length * usedCellSize + 22})`}>
            <text x={0} y={14} fontSize={14} fill="#0f172a" style={{ fontWeight: 700 }}>Legend: {metricLabel}</text>
            <g transform={`translate(110, -8)`}>
              {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                const v = min + (max - min) * t;
                const col = colorForValue(v, min, max);
                return <rect key={i} x={i * 44} y={8} width={40} height={20} fill={col} stroke="rgba(0,0,0,0.04)" rx={6} />;
              })}
              <text x={0} y={50} fontSize={12} fill="#6b7280">{min}</text>
              <text x={176} y={50} fontSize={12} fill="#6b7280" textAnchor="end">{max}</text>
            </g>
          </g>

          {/* Tooltip */}
          {hover && (
            <ToolTip x={clamp(hover.px, leftLabelWidth + 8, Math.min(width, maxSvgWidth) - 320)} y={clamp(hover.py, 6, height - 120)}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>{hover.city} — {hover.year}</div>
              <div style={{ fontSize: 14 }}>{metricLabel}: <span style={{ fontWeight: 800 }}>{hover.value === null ? "N/A" : String(hover.value)}</span></div>
            </ToolTip>
          )}
        </svg>
      </div>
    </div>
  );
};

CityYearHeatmap.propTypes = {
  params: PropTypes.object,
  metricLabel: PropTypes.string,
  cellSize: PropTypes.number,
  lastNYears: PropTypes.number,
  topNCities: PropTypes.number,
  maxSvgWidth: PropTypes.number
};

export default CityYearHeatmap;
