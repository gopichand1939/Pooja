
// src/Redux/store.js (snippet)
import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from './slices/filtersSlice';
import themeReducer from './slices/themeSlice';

export default configureStore({
  reducer: {
    filters: filtersReducer,
    theme: themeReducer,
    // other slices...
  },
});
