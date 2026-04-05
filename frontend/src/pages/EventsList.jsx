import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const { data } = await api.get("/events");
      setEvents(data.events || []);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = events.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      e.clubId?.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || e.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      {/* Hero Banner */}
      <div className="events-page-hero">
        <h1>Campus Events</h1>
        <p>Discover, register, and participate in events across all clubs</p>
      </div>

      {/* Search & Filter */}
      <div className="events-controls" style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
        <input
          placeholder="🔍  Search by title, location or club…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: "1", minWidth: "200px" }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: "160px" }}
        >
          <option value="all">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="center-loader">
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎪</div>
          <p>{search || filter !== "all" ? "No events match your search." : "No events available yet."}</p>
        </div>
      ) : (
        <>
          <div className="section-header">
            <h3 className="section-title">{filtered.length} event{filtered.length !== 1 ? "s" : ""} found</h3>
          </div>
          <div className="events-grid">
            {filtered.map((event) => (
              <Link
                key={event._id}
                to={`/events/${event._id}`}
                className="event-card"
                style={{ textDecoration: "none" }}
              >
                <div className="event-card-top">
                  <span className={`status-badge status-${event.status}`}>
                    {event.status}
                  </span>
                  <span className="event-club">{event.clubId?.name}</span>
                </div>
                <h3 className="event-card-title">{event.title}</h3>
                {event.description && (
                  <p className="muted" style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>
                    {event.description.length > 80
                      ? event.description.slice(0, 80) + "…"
                      : event.description}
                  </p>
                )}
                <div className="event-meta">
                  <span>📅 {new Date(event.date).toLocaleString()}</span>
                  <span>📍 {event.location}</span>
                  <span>👥 {event.registrationsCount || 0} / {event.maxParticipants} registered</span>
                </div>
                <div style={{ marginTop: "10px" }}>
                  <span className="btn btn-sm btn-outline">View Details →</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}