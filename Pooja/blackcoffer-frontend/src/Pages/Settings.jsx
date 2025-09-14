// src/Pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/settings.css"; // create this file (content below)
import profileImage from "../assets/profile.png";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: "User", role: "Admin" });
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("bc_theme") || "light"
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bc_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      }
    } catch (err) {
      // ignore parse errors
    }
  }, []);

  const doLogout = () => {
    // Clear local auth/session keys
    localStorage.removeItem("bc_token");
    localStorage.removeItem("bc_user");
    localStorage.removeItem("bc_remember");
    // optional: clear other app keys
    // localStorage.removeItem("bc_theme");
    navigate("/", { replace: true });
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("bc_theme", next);
    // You can also add a class on document.documentElement to allow global theme CSS
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <div className="settings-page" style={{ padding: "96px 36px" }}>
      <div className="settings-header">
        <h1>Settings</h1>
        <p className="muted">Manage account, preferences and session.</p>
      </div>

      <div className="settings-grid">
        <section className="card profile-card">
<div className="profile-avatar">
  {user?.avatar ? (
    <img
      src={user.avatar}
      alt={`${user.username} avatar`}
      className="avatar-img"
    />
  ) : (
    <img
      src={profileImage}
      alt="default avatar"
      className="avatar-img"
      onError={(e) => {
        e.target.style.display = "none";
        e.target.insertAdjacentHTML(
          "afterend",
          `<div class='avatar-fallback'>${user?.username ? user.username[0].toUpperCase() : "U"}</div>`
        );
      }}
    />
  )}
</div>


          <div className="profile-actions">
            <button className="btn-primary" onClick={() => alert("Edit profile placeholder")}>
              Edit profile
            </button>
            <button className="btn-ghost" onClick={doLogout}>
              Logout
            </button>
          </div>
        </section>

        <section className="card preferences-card">
          <h3>Preferences</h3>

          <div className="pref-row">
            <div>
              <div className="pref-title">Theme</div>
              <div className="muted">Toggle app theme (this stores choice locally)</div>
            </div>
            <div>
              <button className="btn-toggle" onClick={toggleTheme}>
                {theme === "light" ? "Switch to dark" : "Switch to light"}
              </button>
            </div>
          </div>

          <div className="pref-row">
            <div>
              <div className="pref-title">Notifications</div>
              <div className="muted">Control notifications (placeholder)</div>
            </div>
            <div>
              <button className="btn-ghost" onClick={() => alert("Notification prefs placeholder")}>
                Configure
              </button>
            </div>
          </div>
        </section>

        <section className="card danger-card">
          <h3>Danger Zone</h3>
          <p className="muted">Reset local app data (keeps you logged out).</p>
          <div style={{ marginTop: 12 }}>
            <button
              className="btn-danger"
              onClick={() => {
                if (confirm("Clear all local storage for this app?")) {
                  localStorage.clear();
                  navigate("/", { replace: true });
                }
              }}
            >
              Clear local data & logout
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
