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
      <Sidebar />

      <div className="bc-main">
        <Navbar />

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
