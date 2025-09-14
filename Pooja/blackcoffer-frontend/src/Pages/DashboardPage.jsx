// src/Pages/DashboardPage.jsx
import React from "react";
import LineIntensity from "../Components/Dashboard/LineIntensity";
import ScatterPlot from "../Components/Dashboard/ScatterPlot";
import CountryBars from "../Components/Dashboard/CountryBars";
import TopicsByYear from "../Components/Dashboard/TopicsByYear";
import CityYearHeatmap from "../Components/Dashboard/CityYearHeatmap";
import "../styles/dashboard.css";

const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">
        {/* Charts area */}
        <section className="dashboard-right">
          {/* Row 1 */}
          <div className="charts-row">
            <div className="chart-card chart-large">
              <h4 className="card-title">Intensity by Year</h4>
              <LineIntensity />
            </div>

            <div className="chart-card">
              <h4 className="card-title">Intensity vs Likelihood</h4>
              <ScatterPlot />
            </div>
          </div>

          {/* Row 2 — Country + Topics side by side */}
          <div className="charts-row">
            <div className="chart-card chart-medium">
              <h4 className="card-title">By Country</h4>
              <CountryBars />
            </div>

            <div className="chart-card chart-medium">
              <h4 className="card-title">Topics by Year</h4>
              <TopicsByYear />
            </div>
          </div>

          {/* Row 3 — Heatmap alone */}
          <div className="charts-row">
            <div className="chart-card chart-wide">
              <h4 className="card-title">City – Year Heatmap</h4>
              <CityYearHeatmap />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
