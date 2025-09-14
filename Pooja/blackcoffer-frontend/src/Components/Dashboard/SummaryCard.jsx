import React from "react";
import "../Layout/layout.css"; // optional; adjust if you have a dashboard stylesheet

export default function SummaryCard({ title, value }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      padding: "12px",
      borderRadius: "8px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      background: "#fff",
      minWidth: "160px",
      margin: "6px"
    }}>
      <small style={{ color: "#666", fontSize: "12px" }}>{title}</small>
      <strong style={{ fontSize: "20px", marginTop: "6px" }}>{value ?? "—"}</strong>
    </div>
  );
}
