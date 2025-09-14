// src/main.jsx
import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";               // <- add
import store from "./Redux/store";                    // <- add: make sure path is correct
import App from "./App.jsx";

// global styles
import "./index.css";
import "./styles/layout.css";
import "./styles/dashboard.css";
import "./styles/navbar.css";
import "./styles/footer.css";
import "./Components/Layout/sidebar.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
