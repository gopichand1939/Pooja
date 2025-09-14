// src/Components/Layout/Navbar.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import profileImage from "../../assets/profile.png";

const Navbar = () => {
  const navigate = useNavigate();

  const FALLBACK_SIDEBAR = "320px";
  const [sidebarWidth, setSidebarWidth] = useState(FALLBACK_SIDEBAR);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  const storedUser = (() => {
    try {
      const raw = localStorage.getItem("bc_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    function update() {
      const rawVar =
        typeof window !== "undefined"
          ? getComputedStyle(document.documentElement).getPropertyValue("--sidebar-width")
          : "";
      const trimmed = rawVar ? rawVar.trim() : FALLBACK_SIDEBAR;
      const numeric = parseInt(trimmed, 10) || parseInt(FALLBACK_SIDEBAR, 10);
      setIsCollapsed(window.innerWidth <= numeric + 480);
      setSidebarWidth(trimmed || FALLBACK_SIDEBAR);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("bc_token");
    localStorage.removeItem("bc_user");
    localStorage.removeItem("bc_remember");
    try { sessionStorage.clear(); } catch {}
    setOpenMenu(false);
    navigate("/", { replace: true });
  };

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
    boxSizing: "border-box",
  };

  const navCenterStyle = {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    gap: 28,
    alignItems: "center",
  };

  const navLinkStyle = {
    color: "rgba(255,255,255,0.95)",
    fontWeight: 600,
    textDecoration: "none",
    padding: "10px 8px",
    borderRadius: 6,
  };

  const navRightStyle = {
    minWidth: 160,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
  };

  const avatarStyle = {
    width: 40,
    height: 40,
    borderRadius: "50%",
    cursor: "pointer",
    border: "2px solid #fff",
    objectFit: "cover",
  };

  const dropdownStyle = {
    position: "absolute",
    top: "60px",
    right: 0,
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
    width: "240px",
    padding: "10px 0",
    zIndex: 1200,
  };

  const dropdownItemStyle = {
    padding: "10px 16px",
    fontSize: "14px",
    color: "#374151",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  return (
    <header style={headerStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* <img src="/logo.png" alt="logo" style={{ width: 36, height: 36 }} /> */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>DASHBOARD</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 2 }}>
            Blackcoffer
          </div>
        </div>
      </div>

      <nav style={navCenterStyle}>
        <Link style={navLinkStyle} to="/body">Dashboard</Link>
        <Link style={navLinkStyle} to="/body/explorer">Data Explorer</Link>
        <Link style={navLinkStyle} to="/body/insights">Insights</Link>
      </nav>

      <div style={navRightStyle} ref={menuRef}>
<img
  src={storedUser?.avatar || profileImage}
  alt={storedUser?.username || "profile"}
  style={avatarStyle}
  onClick={() => setOpenMenu((s) => !s)}
/>

        {openMenu && (
          <div style={dropdownStyle}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}>
              <div style={{ fontWeight: 600 }}>{storedUser?.username ?? "John Doe"}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {storedUser?.role ?? "Admin"}
              </div>
            </div>

            <div
              style={dropdownItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => { setOpenMenu(false); navigate("/body/profile"); }}
            >
              👤 Profile
            </div>

            <div
              style={dropdownItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => { setOpenMenu(false); navigate("/body/settings"); }}
            >
              ⚙️ Settings
            </div>

            <div
              style={dropdownItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              📄 Billing Plan
            </div>

            <div
              style={dropdownItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              ❓ FAQ
            </div>

            <div
              style={{ ...dropdownItemStyle, color: "#dc2626", fontWeight: 600 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={handleLogout}
            >
              🚪 Logout
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
