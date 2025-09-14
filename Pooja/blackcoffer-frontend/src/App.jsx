// src/App.jsx
import React from "react";
import { RouterProvider } from "react-router-dom";
import appRouter from "./Router/appRouter";

function App() {
  return <RouterProvider router={appRouter} />;
}

export default App;
