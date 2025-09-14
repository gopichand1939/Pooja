// src/Components/Layout/Navbar.jsx
import React, { useEffect, useState } from "react";

const Navbar = () => {
  // default/fallback if --sidebar-width is not defined
  const FALLBACK_SIDEBAR = "320px";

  const [sidebarWidth, setSidebarWidth] = useState(FALLBACK_SIDEBAR);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    function update() {
      // read CSS variable from :root if present
      const rawVar = typeof window !== "undefined"
        ? getComputedStyle(document.documentElement).getPropertyValue("--sidebar-width")
        : "";
      const trimmed = rawVar ? rawVar.trim() : FALLBACK_SIDEBAR;

      // numeric value for simple responsiveness check
      const numeric = parseInt(trimmed, 10) || parseInt(FALLBACK_SIDEBAR, 10);

      // collapse navbar to full width on narrow windows (sidebar likely hidden)
      if (window.innerWidth <= numeric + 480) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }

      setSidebarWidth(trimmed || FALLBACK_SIDEBAR);
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // header inline style — shifted to the right by sidebar width when not collapsed
  const headerStyle = {
    position: "fixed",
    top: 0,
    left: isCollapsed ? "0px" : sidebarWidth,
    width: isCollapsed ? "100%" : `calc(100% - ${sidebarWidth})`,
    height: "72px",
    background: "#6d28d9",
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1100,
    boxShadow: "0 4px 18px rgba(15, 23, 42, 0.06)",
    boxSizing: "border-box"
  };

  const navLeftStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 180
  };

  const navLogoStyle = {
    width: 36,
    height: 36,
    objectFit: "contain"
  };

  const brandTitleStyle = {
    fontWeight: 700,
    fontSize: 16,
    color: "#fff",
    lineHeight: 1
  };

  const brandSubStyle = {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2
  };

  const navCenterStyle = {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    gap: 28,
    alignItems: "center"
  };

  const navLinkStyle = {
    color: "rgba(255,255,255,0.95)",
    fontWeight: 600,
    textDecoration: "none",
    padding: "10px 8px",
    borderRadius: 6
  };

  const navRightStyle = {
    minWidth: 160,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
  };

  const btnProfileStyle = {
    background: "#fff",
    color: "#1f2937",
    padding: "8px 12px",
    borderRadius: 20,
    border: "none",
    fontWeight: 600,
    cursor: "pointer"
  };

  return (
    <header style={headerStyle}>
      <div style={navLeftStyle}>
        <img src="/vite.svg" alt="logo" style={navLogoStyle} />
        <div>
          <div style={brandTitleStyle}>DASHBOARD</div>
          <div style={brandSubStyle}>Blackcoffer</div>
        </div>
      </div>

      <nav style={navCenterStyle}>
        <a style={navLinkStyle} href="/body">Dashboard</a>
        <a style={navLinkStyle} href="/body/explorer">Data Explorer</a>
        <a style={navLinkStyle} href="/body/insights">Insights</a>
      </nav>

      <div style={navRightStyle}>
        <button style={btnProfileStyle}>Profile</button>
      </div>
    </header>
  );
};

export default Navbar;
