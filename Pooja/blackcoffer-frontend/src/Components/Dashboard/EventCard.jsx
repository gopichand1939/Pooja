// src/Components/Dashboard/EventCard.jsx
import React, { useCallback } from "react";
import PropTypes from "prop-types";


export default function EventCard({ event = {}, image }) {
  // safe destructuring with defaults
  const {
    title = "",
    source = "",
    published = "",
    country = "",
    intensity = null,
    likelihood = null,
    relevance = null,
    url = "",
    insight = "",
  } = event || {};

  const displayTitle = title || insight || "Untitled event";
  const initials = (displayTitle.trim().charAt(0) || "E").toUpperCase();

  // helper: open url in new tab (safe)
  const onOpen = useCallback(
    (e) => {
      // if user clicked the link itself the default anchor handles it; this is for the icon/button.
      e.stopPropagation();
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    },
    [url]
  );

  // helper: copy link (graceful)
  const onCopy = useCallback(
    async (e) => {
      e.stopPropagation();
      try {
        if (!url) return;
        await navigator.clipboard.writeText(url);
        // small feedback could be added here
      } catch (err) {
        // ignore - clipboard can fail in some contexts
      }
    },
    [url]
  );

  return (
    <article className="event-card card" aria-labelledby={`ev-${event._id || displayTitle.slice(0,8)}`}>
      <div className="event-inner">
        <div className="event-thumb-small" aria-hidden>
          {image ? (
            <img
              src={image}
              alt={title ? `Image for ${title}` : "event image"}
              loading="lazy"
              decoding="async"
              className="event-thumb-img"
            />
          ) : (
            <div className="thumb-fallback-small" aria-hidden>
              {initials}
            </div>
          )}
        </div>

        <div className="event-main">
          <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
            <a
              id={`ev-${event._id || displayTitle.slice(0,8)}`}
              className="event-title"
              href={url || "#"}
              target={url ? "_blank" : undefined}
              rel={url ? "noreferrer noopener" : undefined}
              aria-label={url ? `Open article for ${displayTitle}` : displayTitle}
            >
              {displayTitle}
            </a>

            <div className="event-actions" aria-hidden>
              {url && (
                <>
                  <button className="icon-btn" title="Open in new tab" onClick={onOpen} aria-label="Open in new tab">🔗</button>
                  <button className="icon-btn" title="Copy link" onClick={onCopy} aria-label="Copy link">📋</button>
                </>
              )}
            </div>
          </div>

          <div className="event-meta small muted" aria-hidden>
            {source && <span>{source}</span>}
            {country && <span> • {country}</span>}
            {published && <span> • {published}</span>}
          </div>

          {insight ? (
            <p className="event-snippet" aria-hidden>
              {insight.length > 200 ? insight.slice(0, 200).trim() + "…" : insight}
            </p>
          ) : null}

          <div className="event-badges" aria-hidden>
            <span className="badge">I: {intensity ?? "-"}</span>
            <span className="badge">L: {likelihood ?? "-"}</span>
            <span className="badge">R: {relevance ?? "-"}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

EventCard.propTypes = {
  event: PropTypes.object,
  image: PropTypes.string,
};
