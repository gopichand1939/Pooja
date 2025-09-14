
// src/Redux/slices/themeSlice.js
import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
  name: "theme",
  initialState: { darkMode: false },
  reducers: {
    toggleTheme(state) {
      state.darkMode = !state.darkMode;
    },
  },
});

// Export actions
export const { toggleTheme } = themeSlice.actions;

// Export reducer as default
export default themeSlice.reducer;
