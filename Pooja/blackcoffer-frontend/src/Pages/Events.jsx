// src/Pages/Events.jsx
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { getEvents, getMeta } from "../Services/api";
import EventCard from "../Components/Dashboard/EventCard";
import NewsCard from "../Components/Dashboard/NewsCard";
import { Pie } from "react-chartjs-2";
import debounceLib from "lodash.debounce";
import "../styles/events.css";

// Chart.js registration (required)
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

/** try to find an image url in an event */
function getImageFromEvent(ev) {
  if (!ev || typeof ev !== "object") return undefined;
  const keys = ["image", "thumbnail", "thumb", "media", "picture", "urlToImage", "source_image", "logo"];
  for (const k of keys) {
    if (ev[k] && typeof ev[k] === "string" && ev[k].trim()) return ev[k].trim();
  }
  if (Array.isArray(ev.media) && ev.media.length) {
    const first = ev.media[0];
    if (first && typeof first === "object") {
      if (first.url) return first.url;
      if (first.thumbnail) return first.thumbnail;
    }
  }
  if (Array.isArray(ev.attachments) && ev.attachments.length && ev.attachments[0].url) return ev.attachments[0].url;
  return undefined;
}

export default function EventsPage() {
  const [meta, setMeta] = useState({});
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [total, setTotal] = useState(0);
  const loaderRef = useRef(null);

  const [filters, setFilters] = useState({ topics: [], region: "", end_year: "" });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getMeta();
        if (!mounted) return;
        setMeta(res.data || {});
      } catch (err) {
        console.error("meta load", err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const fetchPage = useCallback(
    async (p = 1, reset = false) => {
      try {
        setLoading(true);

        // send both 'q' and 'search' params so backend is more likely to accept one
        const params = {
          page: p,
          limit: 20,
          q: q || undefined,
          search: q || undefined,
          topics: filters.topics && filters.topics.length ? filters.topics.join(",") : undefined,
          region: filters.region || undefined,
          end_year: filters.end_year || undefined,
        };

        // debug: watch the network tab to see these being sent
        // eslint-disable-next-line no-console
        console.log("Events.fetchPage params:", params);

        const res = await getEvents(params);
        const payload = res && res.data ? res.data : res;
        const items = Array.isArray(payload)
          ? payload
          : (Array.isArray(payload.items) ? payload.items : (Array.isArray(payload.data) ? payload.data : []));
        const totalCount = typeof payload.total === "number"
          ? payload.total
          : (typeof payload.count === "number" ? payload.count : (Array.isArray(payload) ? payload.length : items.length));

        setEvents((prev) => {
          const next = reset ? Array.from(items) : [...prev, ...items];
          setHasMore(next.length < (totalCount || 0) && items.length > 0);
          return next;
        });

        setTotal(totalCount || 0);
        setPage(p);
      } catch (err) {
        console.error("load events", err);
      } finally {
        setLoading(false);
      }
    },
    [q, filters]
  );

  // debounced setter for q (stable instance)
  const debounced = useMemo(() => debounceLib((val) => setQ(val.trim()), 250), []);
  useEffect(() => () => debounced.cancel(), [debounced]);

  // user typed — reset current list and schedule server fetch via debounced setQ
  const onSearchChange = (val) => {
    setEvents([]);
    setPage(1);
    setHasMore(true);
    debounced(val);
  };

  // infinite scroll
  useEffect(() => {
    const node = loaderRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPage(page + 1);
        }
      },
      { root: null, rootMargin: "220px", threshold: 0.1 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [loaderRef, hasMore, loading, fetchPage, page]);

  useEffect(() => {
    setEvents([]);
    setPage(1);
    setHasMore(true);
    fetchPage(1, true);
  }, [q, filters, fetchPage]);

  const filteredEvents = useMemo(() => {
    if (!q) return events;
    const s = q.toLowerCase();
    return events.filter((e) => {
      const fields = [
        e.title,
        e.insight,
        e.summary,
        e.source,
        e.country,
        e.Country,
        e.topic,
        ...(Array.isArray(e.topics) ? e.topics : [])
      ];
      return fields.some((f) => {
        if (!f) return false;
        const val = Array.isArray(f) ? f.join(" ") : String(f);
        return val.toLowerCase().includes(s);
      });
    });
  }, [events, q]);

  // pie chart data
  const { topTopics, pieData } = useMemo(() => {
    const counts = events.reduce((acc, e) => {
      const t = (e.topic || "Unknown").toString();
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return {
      topTopics: top,
      pieData: {
        labels: top.map((t) => t[0]),
        datasets: [
          {
            data: top.map((t) => t[1]),
            backgroundColor: ["#7c3aed", "#06b6d4", "#f97316", "#ef4444", "#10b981", "#f59e0b"],
            borderWidth: 0,
          },
        ],
      },
    };
  }, [events]);

  const pieOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } };

  return (
    <div className="events-page">
      <div className="events-left">
        <div className="events-header card">
          <div>
            <h2>Events</h2>
            <p className="muted">Browse raw events, news and recent activity. Use search to quickly filter.</p>
          </div>
          <div style={{ minWidth: 280 }}>
            <input
              aria-label="Search events"
              className="search-input"
              placeholder="Search events, topics, countries..."
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="events-meta">
          <div className="meta-pill">{total} events</div>
        </div>

        {/* GRID: 2 columns on desktop, 1 on small screens */}
        <div className="events-list" role="list">
          {filteredEvents.map((ev, idx) => (
            <div key={ev._id || ev.id || `${idx}-${ev.title?.slice(0,12) || "ev"}`} role="listitem">
              <EventCard event={ev} image={getImageFromEvent(ev)} />
            </div>
          ))}

          {loading && <div className="loading-row">Loading…</div>}
          {!loading && filteredEvents.length === 0 && <div className="empty-state">No events match your search.</div>}

          <div ref={loaderRef} style={{ height: 1 }} />
        </div>
      </div>

      <aside className="events-right">
        <div className="card news-card">
          <h4>Latest News</h4>
          <NewsCard
            title={events[0]?.title}
            source={events[0]?.source}
            url={events[0]?.url}
            snippet={events[0]?.insight || events[0]?.title}
            image={getImageFromEvent(events[0])}
          />
          <div style={{ marginTop: 12 }}>
            <button
              className="btn-small"
              onClick={() => {
                setEvents([]);
                setPage(1);
                fetchPage(1, true);
              }}
            >
              View full activity
            </button>
          </div>
        </div>

        <div className="card chart-card">
          <h4>Top topics</h4>
          {pieData && pieData.labels && pieData.labels.length ? (
            <div style={{ height: 200 }}>
              <Pie data={pieData} options={pieOptions} redraw />
            </div>
          ) : (
            <div className="muted">No data</div>
          )}
        </div>

        <div className="card help-card">
          <h4>Quick tips</h4>
          <ul>
            <li>Use the search box to filter by topic or country</li>
            <li>Scroll down to load more events</li>
            <li>Click an event title to open source article</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
