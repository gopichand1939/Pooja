// src/Components/Dashboard/FilterPanel.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";

const DEFAULT_OPTIONS = {
  topics: ["oil", "gas", "energy", "bank", "growth", "market", "war", "automaker", "battery"],
  sectors: ["Energy", "Financial services", "Retail", "Government", "Aerospace & defence"],
  regions: ["World", "Asia", "Northern America", "Eastern Europe"],
  pestles: ["Economic", "Political", "Technological", "Industries"],
  sources: ["Breaking Energy", "Daily Times", "Financial Times", "McKinsey & Company"],
  countries: ["United States of America", "China", "Russia"],
  end_years: ["2016","2017","2018","2019","2020","2021","2022","2023"]
};

const makeInitialFilters = () => ({
  end_year: "",
  topics: [],
  sector: "",
  region: "",
  pestle: "",
  source: [],
  country: [],
  intensity: 0,
  likelihood: 0,
  relevance: 0
});

const FilterPanel = ({ options, onFiltersChanged }) => {
  const effectiveOptions = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  const [filters, setFilters] = useState(() => makeInitialFilters());

  // If you want defaults to be applied from props/options in the future,
  // you can extend this effect to read a `defaultFilters` prop.
  useEffect(() => {
    // keep the component controlled and predictable on mount
    setFilters((f) => ({ ...f }));
  }, []);

  // helper: when we want to notify parent or legacy window event
  const notify = useCallback(
    (payload) => {
      if (typeof onFiltersChanged === "function") {
        onFiltersChanged(payload);
      } else {
        // legacy behaviour — keeps compatibility with existing app wiring
        window.dispatchEvent(new CustomEvent("filtersChanged", { detail: payload }));
      }
    },
    [onFiltersChanged]
  );

  const onChangeSingle = useCallback((key, value) => {
    setFilters((s) => ({ ...s, [key]: value }));
  }, []);

  const onChangeMulti = useCallback((key, selectedOptions) => {
    // selectedOptions expected to be HTMLCollection / NodeList or array of option elements
    const values = Array.from(selectedOptions).map((o) => o.value);
    onChangeSingle(key, values);
  }, [onChangeSingle]);

  const resetFilters = useCallback(() => {
    const reset = makeInitialFilters();
    setFilters(reset);
    notify(null);
  }, [notify]);

  const applyFilters = useCallback(() => {
    notify(filters);
  }, [filters, notify]);

  return (
    <div className="bc-filter-panel" aria-label="Filters panel">
      <div className="filter-group">
        <span className="filter-heading">Filters</span>
      </div>

      {/* End Year */}
      <div className="filter-group">
        <label className="filter-heading" htmlFor="end_year">End Year</label>
        <div className="select-wrapper">
          <select
            className="bc-select"
            id="end_year"
            value={filters.end_year}
            aria-label="Select end year"
            onChange={(e) => onChangeSingle("end_year", e.target.value)}
          >
            <option value="">All End Year</option>
            {effectiveOptions.end_years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Topics (multiple) */}
      <div className="filter-group">
        <label className="filter-heading" htmlFor="topics">Topics</label>
        <select
          className="bc-select"
          id="topics"
          multiple
          aria-label="Select topics"
          value={filters.topics}
          onChange={(e) => onChangeMulti("topics", e.target.selectedOptions)}
        >
          {effectiveOptions.topics.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Sector (single) */}
      <div className="filter-group">
        <label className="filter-heading" htmlFor="sector">Sector</label>
        <div className="select-wrapper">
          <select
            className="bc-select"
            id="sector"
            value={filters.sector}
            aria-label="Select sector"
            onChange={(e) => onChangeSingle("sector", e.target.value)}
          >
            <option value="">All Sector</option>
            {effectiveOptions.sectors.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Region */}
      <div className="filter-group">
        <label className="filter-heading" htmlFor="region">Region</label>
        <div className="select-wrapper">
          <select
            className="bc-select"
            id="region"
            value={filters.region}
            aria-label="Select region"
            onChange={(e) => onChangeSingle("region", e.target.value)}
          >
            <option value="">All Region</option>
            {effectiveOptions.regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* PESTLE */}
      <div className="filter-group">
        <label className="filter-heading" htmlFor="pestle">PESTLE</label>
        <div className="select-wrapper">
          <select
            className="bc-select"
            id="pestle"
            value={filters.pestle}
            aria-label="Select pestle"
            onChange={(e) => onChangeSingle("pestle", e.target.value)}
          >
            <option value="">All PESTLE</option>
            {effectiveOptions.pestles.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Source (multiple) */}
      <div className="filter-group">
        <label className="filter-heading" htmlFor="source">Source</label>
        <select
          className="bc-select"
          id="source"
          multiple
          aria-label="Select sources"
          value={filters.source}
          onChange={(e) => onChangeMulti("source", e.target.selectedOptions)}
        >
          {effectiveOptions.sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Country (multiple) */}
      <div className="filter-group">
        <label className="filter-heading" htmlFor="country">Country</label>
        <select
          className="bc-select"
          id="country"
          multiple
          aria-label="Select countries"
          value={filters.country}
          onChange={(e) => onChangeMulti("country", e.target.selectedOptions)}
        >
          {effectiveOptions.countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Ranges */}
      <div className="filter-group">
        <div className="filter-heading">Min Intensity</div>
        <div className="range-row">
          <input
            type="range"
            id="intensity"
            min="0"
            max="100"
            value={filters.intensity}
            aria-label="Minimum intensity"
            onChange={(e) => onChangeSingle("intensity", Number(e.target.value))}
          />
          <div className="range-value" aria-live="polite">{filters.intensity}</div>
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-heading">Min Likelihood</div>
        <div className="range-row">
          <input
            type="range"
            id="likelihood"
            min="0"
            max="10"
            value={filters.likelihood}
            aria-label="Minimum likelihood"
            onChange={(e) => onChangeSingle("likelihood", Number(e.target.value))}
          />
          <div className="range-value" aria-live="polite">{filters.likelihood}</div>
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-heading">Min Relevance</div>
        <div className="range-row">
          <input
            type="range"
            id="relevance"
            min="0"
            max="10"
            value={filters.relevance}
            aria-label="Minimum relevance"
            onChange={(e) => onChangeSingle("relevance", Number(e.target.value))}
          />
          <div className="range-value" aria-live="polite">{filters.relevance}</div>
        </div>
      </div>

      <div className="filter-actions">
        <button
          type="button"
          className="btn-apply"
          onClick={applyFilters}
          aria-label="Apply filters"
        >
          Apply
        </button>
        <button
          type="button"
          className="btn-reset"
          onClick={resetFilters}
          aria-label="Reset filters"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

FilterPanel.propTypes = {
  options: PropTypes.shape({
    topics: PropTypes.arrayOf(PropTypes.string),
    sectors: PropTypes.arrayOf(PropTypes.string),
    regions: PropTypes.arrayOf(PropTypes.string),
    pestles: PropTypes.arrayOf(PropTypes.string),
    sources: PropTypes.arrayOf(PropTypes.string),
    countries: PropTypes.arrayOf(PropTypes.string),
    end_years: PropTypes.arrayOf(PropTypes.string)
  }),
  // callback receives filters object (or null on reset). If not provided,
  // component will emit a legacy window event "filtersChanged".
  onFiltersChanged: PropTypes.func
};

FilterPanel.defaultProps = {
  options: DEFAULT_OPTIONS,
  onFiltersChanged: undefined
};

export default FilterPanel;
