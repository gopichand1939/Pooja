
// src/Redux/slices/filtersSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // basic selects
  end_year: "",
  topics: [],       // array of strings
  sector: "",
  region: "",
  pestle: "",
  source: [],       // array of strings
  swot: [],         // array of strings (if you want multi-select)
  country: [],      // array
  city: [],         // array

  // numeric ranges (you can expand to provide min/max if needed)
  min_intensity: null,
  max_intensity: null,
  min_likelihood: null,
  max_likelihood: null,
  min_relevance: null,
  max_relevance: null,

  // paging / misc (optional)
  limit: 100,
  sort: "",

  // UI helpers
  lastUpdated: null
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setFilters(state, action) {
      const payload = action.payload || {};
      Object.keys(payload).forEach((k) => {
        // only set keys that exist in state
        if (k in state) state[k] = payload[k];
        else state[k] = payload[k]; // allow extra keys if wanted
      });
      state.lastUpdated = Date.now();
    },
    updateFilter(state, action) {
      const { key, value } = action.payload;
      state[key] = value;
      state.lastUpdated = Date.now();
    },
    resetFilters(state) {
      Object.keys(initialState).forEach((k) => {
        state[k] = initialState[k];
      });
      state.lastUpdated = Date.now();
    },
  },
});

export const { setFilters, updateFilter, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;

// selector helper (use from components)
export const selectFilters = (state) => state.filters || initialState;
