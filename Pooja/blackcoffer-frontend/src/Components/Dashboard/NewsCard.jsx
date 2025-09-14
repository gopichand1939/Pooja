import React from "react";
import PropTypes from "prop-types";

export default function NewsCard({ title, snippet, source, url, image }) {
  const initials = (title || "").trim() ? (title.trim()[0] || "").toUpperCase() : "?";

  return (
    <div className="news-snippet news-card-row">
      <div className="news-thumb">
        {image ? (
          <a href={url || "#"} target="_blank" rel="noreferrer" className="thumb-link">
            <img src={image} alt={title ? `Image for ${title}` : "news image"} loading="lazy" />
          </a>
        ) : (
          <div className="thumb-fallback" aria-hidden>
            {initials}
          </div>
        )}
      </div>

      <div className="news-body">
        <a href={url || "#"} target="_blank" rel="noreferrer" className="news-title-link">
          <h5 className="news-title">{title || "No recent news"}</h5>
        </a>

        {source && <div className="muted small">{source}</div>}

        {snippet && <p className="news-brief">{snippet.length > 150 ? snippet.slice(0, 150) + "…" : snippet}</p>}

        {url && (
          <div style={{ marginTop: 8 }}>
            <a className="btn-small" href={url} target="_blank" rel="noreferrer">Read</a>
          </div>
        )}
      </div>
    </div>
  );
}

NewsCard.propTypes = {
  title: PropTypes.string,
  snippet: PropTypes.string,
  source: PropTypes.string,
  url: PropTypes.string,
  image: PropTypes.string,
};
