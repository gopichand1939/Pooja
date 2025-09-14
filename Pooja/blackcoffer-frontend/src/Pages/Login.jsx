import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function Login() {
  const [username, setUsername] = useState("SuperAdmin1");
  const [password, setPassword] = useState("SuperAdmin1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.message || "Login failed");
        setLoading(false);
        return;
      }
      localStorage.setItem("bc_token", body.token);
      localStorage.setItem("bc_user", JSON.stringify(body.user || { username }));
      if (remember) localStorage.setItem("bc_remember", "1");
      navigate("/body");
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left side with branding / image */}
      <div className="left-side" aria-hidden>
        <div className="brand">
          <h1>BLACKCOFFER</h1>
          <p className="subtitle">Admin Amplified — powerful insights & controls</p>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="right-side">
        <div className="login-card">
          <h2 className="card-title">Welcome back</h2>
          <p className="card-sub">Sign in to continue to your dashboard</p>

          <form onSubmit={onSubmit} className="login-form">
            <label className="field">
              <span className="label">User Name</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="input"
                autoComplete="username"
              />
            </label>

            <label className="field">
              <span className="label">Password</span>
              <div className="pwd-wrap">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  type={showPwd ? "text" : "password"}
                  className="input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="show-btn"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="controls">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember Me</span>
              </label>
              <a className="forgot" href="#/forgot">
                Forgot password?
              </a>
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="hint">
              Test credentials: <strong>SuperAdmin1 / SuperAdmin1</strong>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
