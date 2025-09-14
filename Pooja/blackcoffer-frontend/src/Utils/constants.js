
// src/Utils/constants.js

// 🔹 Base URL (use Vite env if set, else fallback to localhost)
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

/* ---------------------------
   📌 Variables → APIs
--------------------------- */

// Intensity
export const API_INTENSITY_BY_YEAR = API_BASE + "/api/agg/intensity-by-year";   // Line chart by Year
export const API_BY_COUNTRY        = API_BASE + "/api/agg/by-country";         // Bar / Choropleth by Country
export const API_SCATTER           = API_BASE + "/api/agg/scatter";            // Scatter Plot

// Likelihood
export const API_LIKELIHOOD = API_SCATTER;   // Scatter Plot (x-axis)

// Relevance
export const API_RELEVANCE  = API_SCATTER;   // Scatter Plot (bubble size)

// Year
export const API_TOPICS_BY_YEAR    = API_BASE + "/api/agg/topics-by-year";     // Stacked Bar by Year
export const API_CITY_YEAR_HEATMAP = API_BASE + "/api/agg/city-year-heatmap";  // Heatmap (City vs Year)

// Region
export const API_REGION = API_BASE + "/api/events"; // Add ?region=Asia etc.

/* ---------------------------
   📌 Filters → APIs
--------------------------- */

// These are same endpoints but with query params
// Example: API_INTENSITY_BY_YEAR + "?end_year=2020"

// End Year
export const FILTER_END_YEAR = API_INTENSITY_BY_YEAR;

// Topics
export const FILTER_TOPICS = API_SCATTER;

// Sector
export const FILTER_SECTOR = API_BY_COUNTRY;

// Region
export const FILTER_REGION = API_INTENSITY_BY_YEAR;

// PEST
export const FILTER_PEST = API_TOPICS_BY_YEAR;

// Source
export const FILTER_SOURCE = API_CITY_YEAR_HEATMAP;

// SWOT
export const FILTER_SWOT = API_REGION;

// Country
export const FILTER_COUNTRY = API_BY_COUNTRY;

// City
export const FILTER_CITY = API_CITY_YEAR_HEATMAP;

// Extra Filters
export const FILTER_EVENTS = API_REGION;

/* ---------------------------
   📌 Utility APIs
--------------------------- */

export const API_EVENTS   = API_BASE + "/api/events"; // Raw events
export const API_META     = API_BASE + "/api/meta";   // Dropdown data
export const API_HEALTH   = API_BASE + "/health";     // Health check

/* ---------------------------
   📌 Ready-to-use (examples)
--------------------------- */

export const SAMPLE_INTENSITY_BY_YEAR = 
  API_INTENSITY_BY_YEAR + "?end_year=2020&region=Asia&country=India&min_intensity=2&max_intensity=9";

export const SAMPLE_BY_COUNTRY =
  API_BY_COUNTRY + "?region=Europe&sector=Energy&min_relevance=3";

export const SAMPLE_SCATTER =
  API_SCATTER + "?topics=oil,gas&min_likelihood=2&max_likelihood=8&min_relevance=1";

export const SAMPLE_TOPICS_BY_YEAR =
  API_TOPICS_BY_YEAR + "?start_year=2015&end_year=2022&pestle=Economic&topics=oil,renewables";

export const SAMPLE_CITY_YEAR_HEATMAP =
  API_CITY_YEAR_HEATMAP + "?city=Delhi&source=EIA";

export const SAMPLE_EVENTS =
  API_EVENTS + "?region=Asia&country=India&swot=Strength&min_intensity=3&max_intensity=8&search=oil";
