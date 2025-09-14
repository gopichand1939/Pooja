// src/Router/ProtectRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectRoute = ({ children }) => {
  const token = localStorage.getItem("bc_token");
  return token ? children : <Navigate to="/" replace />;
};

export default ProtectRoute;
