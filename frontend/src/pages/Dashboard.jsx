import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../services/auth.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [cancelMsg, setCancelMsg] = useState("");
  const regSectionRef = useRef(null);

  useEffect(() => {
    if (user?.role === "student") {
      fetchMyRegistrations();
    }
  }, [user]);

  async function fetchMyRegistrations() {
    setLoadingRegs(true);
    try {
      const { data } = await api.get("/registrations/me");
      setRegistrations(data.registrations || []);
    } catch (err) {
      console.error("Failed to fetch registrations:", err);
    } finally {
      setLoadingRegs(false);
    }
  }

  async function handleCancel(regId) {
    try {
      await api.patch(`/registrations/${regId}/cancel`);
      setCancelMsg("✅ Registration cancelled.");
      setTimeout(() => setCancelMsg(""), 3000);
      fetchMyRegistrations();
    } catch (err) {
      setCancelMsg("❌ Failed to cancel. Try again.");
      setTimeout(() => setCancelMsg(""), 3000);
    }
  }

  function scrollToRegistrations() {
    regSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="dashboard-page">
      {/* Hero */}
      <div className="dashboard-hero">
        <div className="dashboard-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="dashboard-welcome">
          <h2>Welcome back, <span className="accent">{user?.name}</span> 👋</h2>
          <p className="muted">
            Logged in as{" "}
            <span className={`role-tag role-${user?.role}`}>{user?.role}</span>
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-header">
        <h3 className="section-title">Quick Actions</h3>
      </div>

      <div className="quick-actions-grid">
        <Link to="/events" className="action-card">
          <div className="action-icon">🎪</div>
          <h4>Browse Events</h4>
          <p className="muted">Explore upcoming events on campus</p>
        </Link>

        {/* STUDENT */}
        {user?.role === "student" && (
          <div
            className="action-card"
            onClick={scrollToRegistrations}
            style={{ cursor: "pointer" }}
          >
            <div className="action-icon">📋</div>
            <h4>My Registrations</h4>
            <p className="muted">
              {loadingRegs
                ? "Loading…"
                : `${registrations.length} event(s) registered`}
            </p>
          </div>
        )}

        {/* ORGANIZER */}
        {user?.role === "organizer" && (
          <>
            <Link to="/organizer/events" className="action-card">
              <div className="action-icon">🗓️</div>
              <h4>Manage Events</h4>
              <p className="muted">Create and edit your club events</p>
            </Link>
            <Link to="/organizer/events" className="action-card">
              <div className="action-icon">👥</div>
              <h4>View Participants</h4>
              <p className="muted">See who signed up for your events</p>
            </Link>
          </>
        )}

        {/* ADMIN */}
        {user?.role === "admin" && (
          <>
            <Link to="/admin/users" className="action-card">
              <div className="action-icon">👤</div>
              <h4>Manage Users</h4>
              <p className="muted">View, edit and manage all users</p>
            </Link>
            <Link to="/admin/events" className="action-card">
              <div className="action-icon">🛡️</div>
              <h4>Admin Events</h4>
              <p className="muted">Oversee all events across clubs</p>
            </Link>
            <Link to="/organizer/events" className="action-card">
              <div className="action-icon">➕</div>
              <h4>Create Event</h4>
              <p className="muted">Quickly create a new event</p>
            </Link>
          </>
        )}
      </div>

      {/* ===== STUDENT: My Registrations ===== */}
      {user?.role === "student" && (
        <div className="my-registrations" ref={regSectionRef}>
          <div className="section-header">
            <h3 className="section-title">My Registrations</h3>
            <button
              className="btn btn-sm btn-ghost"
              onClick={fetchMyRegistrations}
              disabled={loadingRegs}
            >
              {loadingRegs ? "Refreshing…" : "↻ Refresh"}
            </button>
          </div>

          {cancelMsg && (
            <div
              className={`toast ${cancelMsg.startsWith("✅") ? "toast-success" : "toast-error"}`}
              style={{ marginBottom: "16px" }}
            >
              {cancelMsg}
            </div>
          )}

          {loadingRegs ? (
            <div className="center-loader">
              <div className="spinner" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎫</div>
              <p>You haven't registered for any events yet.</p>
              <Link to="/events" className="btn" style={{ marginTop: "12px" }}>
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="events-grid">
              {registrations.map((reg) => {
                const ev = reg.eventId;
                return (
                  <div key={reg._id} className="event-card">
                    <div className="event-card-top">
                      <span className={`status-badge status-${ev?.status || "upcoming"}`}>
                        {ev?.status || "upcoming"}
                      </span>
                      {ev?.clubId?.name && (
                        <span className="event-club">{ev.clubId.name}</span>
                      )}
                    </div>
                    <h3 className="event-card-title">{ev?.title || "Event"}</h3>
                    <div className="event-meta">
                      <span>
                        📅{" "}
                        {ev?.date
                          ? new Date(ev.date).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—"}
                      </span>
                      <span>📍 {ev?.location || "—"}</span>
                    </div>
                    <div className="event-card-actions">
                      <Link
                        to={`/events/${ev?._id}`}
                        className="btn btn-sm btn-outline"
                      >
                        View
                      </Link>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleCancel(reg._id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
