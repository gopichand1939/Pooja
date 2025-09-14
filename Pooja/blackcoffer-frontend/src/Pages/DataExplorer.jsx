import React, { useEffect, useState } from "react";
import AnimatedSummaryCard from "../Components/Dashboard/AnimatedSummaryCard";
import D3LineChart from "../Components/Dashboard/D3LineChart";
import D3Scatter from "../Components/Dashboard/D3Scatter";
import Loader from "../Components/Common/Loader";
import { fetchMeta, fetchIntensityByYear, fetchScatter } from "../Services/api"; // your existing API helpers
import "./dataExplorer.css";

export default function DataExplorer() {
  const [meta, setMeta] = useState(null);
  const [lineData, setLineData] = useState([]);
  const [scatterData, setScatterData] = useState([]);
  const [kpis, setKpis] = useState({ total: 0, avgIntensity: 0, years: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const m = await fetchMeta().catch(() => null);
        setMeta(m);
        const intensity = await fetchIntensityByYear({}).catch(() => null);
        const scatter = await fetchScatter({}).catch(() => null);

        // fallback sample if your APIs return 304/empty
        const sampleIntensity = intensity && intensity.length ? intensity :
          [
            { year: 2016, avgIntensity: 8 },
            { year: 2017, avgIntensity: 12 },
            { year: 2018, avgIntensity: 9 },
            { year: 2019, avgIntensity: 11 },
            { year: 2020, avgIntensity: 14 },
            { year: 2021, avgIntensity: 78 },
            { year: 2022, avgIntensity: 10 },
            { year: 2023, avgIntensity: 11 }
          ];

        const sampleScatter = scatter && scatter.length ? scatter :
          Array.from({ length: 40 }).map((_, i) => ({
            likelihood: Math.floor(Math.random() * 5),
            intensity: Math.floor(Math.random() * 100),
            relevance: Math.round(Math.random() * 5) + 1,
            label: `E${i+1}`
          }));

        setLineData(sampleIntensity);
        setScatterData(sampleScatter);

        const total = 120; // derive from API if available
        const avgIntensity = ((sampleIntensity.reduce((s, d) => s + (d.avgIntensity || 0), 0) / sampleIntensity.length) || 0).toFixed(2);
        const years = `${sampleIntensity[0].year}–${sampleIntensity[sampleIntensity.length - 1].year}`;
        setKpis({ total, avgIntensity, years });
      } catch (err) {
        console.error("load explorer", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="df-explorer-page">
      <header className="df-explorer-header">
        <h1>Data Explorer</h1>
        <p className="muted">Interactive visualisations — hover charts and cards for details</p>
      </header>

      <section className="df-kpi-row">
        <AnimatedSummaryCard title="Total Events" value={kpis.total} accent="#7C3AED" />
        <AnimatedSummaryCard title="Avg Intensity" value={kpis.avgIntensity} accent="#0EA5A4" />
        <AnimatedSummaryCard title="Years" value={kpis.years} accent="#F97316" />
      </section>

      <section className="df-charts-grid">
        <div className="df-card">
          <h4>Intensity by Year</h4>
          <D3LineChart data={lineData} height={320} margin={{top:20,right:20,bottom:40,left:50}} />
        </div>

        <div className="df-card">
          <h4>Intensity vs Likelihood (scatter)</h4>
          <D3Scatter data={scatterData} height={320} margin={{top:20,right:20,bottom:40,left:50}} />
        </div>
      </section>
    </div>
  );
}
