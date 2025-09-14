// src/Components/Layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";
import FilterPanel from "../../Components/Dashboard/FilterPanel";

const Sidebar = () => {
  const navItems = [
    { to: "/body", label: "Dashboard" },
    { to: "/body/events", label: "Events" },
    { to: "/body/settings", label: "Settings" },
  ];

  return (
    <aside className="bc-sidebar">
      <div className="sidebar-brand">
        <img src="/vite.svg" alt="logo" className="brand-logo" />
        <div className="brand-text">Blackcoffer</div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-filters">
        <FilterPanel />
      </div>

      <div className="sidebar-footer">v1.0</div>
    </aside>
  );
};

export default Sidebar;
