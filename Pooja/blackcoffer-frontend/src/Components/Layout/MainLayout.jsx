// src/Components/Layout/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../../styles/layout.css";

const MainLayout = () => {
  return (
    <div className="bc-app">
      {/* Sidebar (left) */}
      <Sidebar />

      {/* Main content area */}
      <div className="bc-main">
        <Navbar />

        {/* Outer's top area gets reserved under the navbar by CSS */}
        <main className="bc-content">
          <div className="container-dashboard">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
