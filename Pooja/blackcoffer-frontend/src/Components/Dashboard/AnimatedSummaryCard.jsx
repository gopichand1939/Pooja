import React, { useRef } from "react";
import "./animatedSummary.css";

export default function AnimatedSummaryCard({ title, value, accent = "#6b21a8" }) {
  const ref = useRef();

  function handleMove(e) {
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;
    const tilt = 8; 
    el.style.transform = `perspective(800px) rotateX(${(-py * tilt).toFixed(2)}deg) rotateY(${(px * tilt).toFixed(2)}deg) scale(1.02)`;
    el.style.boxShadow = `${-px * 12}px ${py * 12}px 30px rgba(0,0,0,0.12)`;
  }

  function handleLeave() {
    const el = ref.current;
    el.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)`;
    el.style.boxShadow = `0 6px 18px rgba(16,24,40,0.06)`;
  }

  return (
    <div
      ref={ref}
      className="animated-summary"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      role="group"
      tabIndex={0}
      aria-label={`${title} ${value}`}
      style={{ ["--accent"]: accent }}
    >
      <div className="summary-content">
        <small className="summary-title">{title}</small>
        <div className="summary-value">{value ?? "—"}</div>
      </div>
    </div>
  );
}
