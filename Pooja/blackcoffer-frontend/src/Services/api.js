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
 * (keeps api.js self-contained without requiring buildUrl from constants)
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

// Utilities
export const getHealth = () => api.get(API_HEALTH);
export const getMeta = () => api.get(API_META);

// Events
export const getEvents = (params = {}) => api.get(buildUrl(API_EVENTS, params));

// Aggregations
export const getIntensityByYear = (params = {}) =>
  api.get(buildUrl(API_INTENSITY_BY_YEAR, params));

export const getByCountry = (params = {}) => api.get(buildUrl(API_BY_COUNTRY, params));

export const getScatter = (params = {}) => api.get(buildUrl(API_SCATTER, params));

export const getTopicsByYear = (params = {}) =>
  api.get(buildUrl(API_TOPICS_BY_YEAR, params));

export const getCityYearHeatmap = (params = {}) =>
  api.get(buildUrl(API_CITY_YEAR_HEATMAP, params));

export default api;
