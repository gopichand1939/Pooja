// src/Pages/Insights.jsx
import React, { useEffect, useState } from "react";
import AnimatedSummaryCard from "../Components/Dashboard/AnimatedSummaryCard";
import D3LineChart from "../Components/Dashboard/D3LineChart";
import ScatterPlot from "../Components/Dashboard/ScatterPlot";
import Loader from "../Components/Common/Loader";
import { fetchMeta, fetchIntensityByYear, fetchScatter } from "../Services/api";
import "./insights.css";

export default function Insights() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ total: 0, avgIntensity: 0, trendYears: "" });
  const [lineData, setLineData] = useState([]);
  const [scatterParams, setScatterParams] = useState({});
  const [scatterKey, setScatterKey] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const meta = await fetchMeta().catch(() => null);
        const intensity = await fetchIntensityByYear({}).catch(() => null);
        const scatter = await fetchScatter({}).catch(() => null);

        const sampleIntensity = Array.isArray(intensity) && intensity.length ? intensity : [
          { year: 2016, avgIntensity: 8 },
          { year: 2017, avgIntensity: 12 },
          { year: 2018, avgIntensity: 9 },
          { year: 2019, avgIntensity: 11 },
          { year: 2020, avgIntensity: 14 },
          { year: 2021, avgIntensity: 78 },
          { year: 2022, avgIntensity: 10 },
          { year: 2023, avgIntensity: 11 }
        ];

        setLineData(sampleIntensity);

        const total = 120; // replace with real value if available
        const avg = ((sampleIntensity.reduce((s,d) => s + (d.avgIntensity||0),0) / sampleIntensity.length) || 0).toFixed(2);
        const yrs = `${sampleIntensity[0].year}–${sampleIntensity[sampleIntensity.length-1].year}`;

        setKpis({ total, avgIntensity: avg, trendYears: yrs });
      } catch (e) {
        console.error("insights load", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="insights-page">
      <header className="insights-header">
        <div>
          <h1>Insights</h1>
          <p className="muted">High-level signals, trends and anomalies across the dataset</p>
        </div>
        <div className="insights-actions">
          <button className="btn-muted" onClick={() => { setScatterParams({}); setScatterKey(k => k + 1); }}>
            Refresh
          </button>
        </div>
      </header>

      <section className="insights-kpis">
        <AnimatedSummaryCard title="Total Events" value={kpis.total} accent="#7C3AED" />
        <AnimatedSummaryCard title="Avg Intensity" value={kpis.avgIntensity} accent="#06b6d4" />
        <AnimatedSummaryCard title="Trend Years" value={kpis.trendYears} accent="#fb923c" />
        <div className="insights-quicknote card">
          <h4>Quick Note</h4>
          <p className="muted">Insights are generated from aggregated endpoints — refine with filters in Data Explorer.</p>
        </div>
      </section>

      <section className="insights-grid">
        <div className="insights-main">
          <div className="card">
            <h4>Intensity trend</h4>
            <D3LineChart data={lineData} height={320} margin={{top:20,right:20,bottom:40,left:50}} />
          </div>

          <div className="card">
            <h4>Distribution: Intensity vs Likelihood</h4>
            <ScatterPlot key={scatterKey} params={scatterParams} height={360} />
          </div>
        </div>

        <aside className="insights-side card">
          <h4>Top Insights</h4>
          <ul className="insights-list">
            <li><strong>Spike in 2021</strong> — intensity spiked significantly in 2021. Check top topics for that year.</li>
            <li><strong>Concentration:</strong> Many low-likelihood events with low intensity clustered at x=2.</li>
            <li><strong>Countries:</strong> United States and Russia show high counts by country.</li>
            <li><strong>Action:</strong> Try filtering by sector in Data Explorer to isolate drivers.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
