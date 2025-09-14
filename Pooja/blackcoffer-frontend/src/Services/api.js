// // src/Services/api.js
// import axios from "axios";
// import {
//   API_BASE,
//   API_EVENTS,
//   API_META,
//   API_HEALTH,
//   API_INTENSITY_BY_YEAR,
//   API_BY_COUNTRY,
//   API_SCATTER,
//   API_TOPICS_BY_YEAR,
//   API_CITY_YEAR_HEATMAP,
// } from "../Utils/constants";

// /**
//  * Simple helper to build query strings from an object
//  * (keeps api.js self-contained without requiring buildUrl from constants)
//  */
// function buildUrl(url, params = {}) {
//   const keys = Object.keys(params).filter((k) => params[k] !== undefined && params[k] !== "");
//   if (!keys.length) return url;
//   const query = keys
//     .map((k) => {
//       const val = params[k];
//       const serial = Array.isArray(val) ? val.join(",") : val;
//       return `${encodeURIComponent(k)}=${encodeURIComponent(serial)}`;
//     })
//     .join("&");
//   return `${url}?${query}`;
// }

// // Axios instance
// const api = axios.create({
//   baseURL: API_BASE || "http://localhost:4000",
//   timeout: 15000,
// });

// // Utilities
// export const getHealth = () => api.get(API_HEALTH);
// export const getMeta = () => api.get(API_META);

// // Events
// export const getEvents = (params = {}) => api.get(buildUrl(API_EVENTS, params));

// // Aggregations
// export const getIntensityByYear = (params = {}) =>
//   api.get(buildUrl(API_INTENSITY_BY_YEAR, params));

// export const getByCountry = (params = {}) => api.get(buildUrl(API_BY_COUNTRY, params));

// export const getScatter = (params = {}) => api.get(buildUrl(API_SCATTER, params));

// export const getTopicsByYear = (params = {}) =>
//   api.get(buildUrl(API_TOPICS_BY_YEAR, params));

// export const getCityYearHeatmap = (params = {}) =>
//   api.get(buildUrl(API_CITY_YEAR_HEATMAP, params));

// export default api;



// src/Services/api.js
import axios from "axios";
import {
  API_BASE,
  API_EVENTS,
  API_META,
  API_HEALTH,
  API_INTENSITY_BY_YEAR,
  API_BY_COUNTRY,
  API_SCATTER,
  API_TOPICS_BY_YEAR,
  API_CITY_YEAR_HEATMAP,
} from "../Utils/constants";

/**
 * Simple helper to build query strings from an object
 */
function buildUrl(url, params = {}) {
  const keys = Object.keys(params).filter((k) => params[k] !== undefined && params[k] !== "");
  if (!keys.length) return url;
  const query = keys
    .map((k) => {
      const val = params[k];
      const serial = Array.isArray(val) ? val.join(",") : val;
      return `${encodeURIComponent(k)}=${encodeURIComponent(serial)}`;
    })
    .join("&");
  return `${url}?${query}`;
}

// Axios instance
const api = axios.create({
  baseURL: API_BASE || "http://localhost:4000",
  timeout: 15000,
});

/* ----------------------
   Low-level (axios) exports
   kept for compatibility with older code
   ---------------------- */
export const getHealth = () => api.get(API_HEALTH);
export const getMeta = () => api.get(API_META);
export const getEvents = (params = {}) => api.get(buildUrl(API_EVENTS, params));

export const getIntensityByYear = (params = {}) =>
  api.get(buildUrl(API_INTENSITY_BY_YEAR, params));

export const getByCountry = (params = {}) => api.get(buildUrl(API_BY_COUNTRY, params));

export const getScatter = (params = {}) => api.get(buildUrl(API_SCATTER, params));

export const getTopicsByYear = (params = {}) =>
  api.get(buildUrl(API_TOPICS_BY_YEAR, params));

export const getCityYearHeatmap = (params = {}) =>
  api.get(buildUrl(API_CITY_YEAR_HEATMAP, params));

/* ----------------------
   Higher-level wrappers expected by pages/components
   These return response.data (not the full axios response)
   and mirror the names used in DataExplorer.jsx and my suggested components.
   ---------------------- */

export async function fetchMeta() {
  try {
    const res = await getMeta();
    return res.data;
  } catch (err) {
    console.error("fetchMeta error:", err);
    throw err;
  }
}

export async function fetchIntensityByYear(params = {}) {
  try {
    const res = await getIntensityByYear(params);
    return res.data;
  } catch (err) {
    console.error("fetchIntensityByYear error:", err);
    throw err;
  }
}

export async function fetchScatter(params = {}) {
  try {
    const res = await getScatter(params);
    return res.data;
  } catch (err) {
    console.error("fetchScatter error:", err);
    throw err;
  }
}

export async function fetchByCountry(params = {}) {
  try {
    const res = await getByCountry(params);
    return res.data;
  } catch (err) {
    console.error("fetchByCountry error:", err);
    throw err;
  }
}

export async function fetchTopicsByYear(params = {}) {
  try {
    const res = await getTopicsByYear(params);
    return res.data;
  } catch (err) {
    console.error("fetchTopicsByYear error:", err);
    throw err;
  }
}

export async function fetchCityYearHeatmap(params = {}) {
  try {
    const res = await getCityYearHeatmap(params);
    return res.data;
  } catch (err) {
    console.error("fetchCityYearHeatmap error:", err);
    throw err;
  }
}

/* Keep axios default export in case other modules import it */
export default api;
