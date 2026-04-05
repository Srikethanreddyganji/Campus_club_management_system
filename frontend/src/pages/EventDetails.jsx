import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../services/auth.jsx";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchEvent();
  }, [id]);

  /* also check if this student already registered when user is known */
  useEffect(() => {
    if (user?.role === "student") {
      checkRegistration();
    }
  }, [user, id]);

  async function fetchEvent() {
    setLoading(true);
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data.event);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function checkRegistration() {
    try {
      const { data } = await api.get("/registrations/me");
      const regs = data.registrations || [];
      const found = regs.some(
        (r) => (r.eventId?._id || r.eventId) === id ||
                (r.eventId?._id || r.eventId)?.toString() === id
      );
      setAlreadyRegistered(found);
    } catch {
      /* not critical — ignore */
    }
  }

  async function handleRegister() {
    setRegistering(true);
    setMessage({ text: "", type: "" });
    try {
      const { data } = await api.post("/registrations", { eventId: id });
      setMessage({
        text: data.message || "🎉 Registered successfully!",
        type: "success",
      });
      setAlreadyRegistered(true);
      /* re-fetch event to update seat count */
      fetchEvent();
    } catch (err) {
      setMessage({
        text: err?.response?.data?.message || "❌ Registration failed",
        type: "error",
      });
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <div className="center-loader">
        <div className="spinner" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <p>Event not found.</p>
        <button
          className="btn"
          style={{ marginTop: "16px" }}
          onClick={() => navigate("/events")}
        >
          Back to Events
        </button>
      </div>
    );
  }

  const isFull = event.registrationsCount >= event.maxParticipants;
  const isPast = new Date(event.date) < new Date();
  const isUpcoming = event.status === "upcoming" && !isPast;

  return (
    <div className="event-details-card">
      {/* Back */}
      <button
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: "24px" }}
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <div>
          <span
            className={`status-badge status-${event.status}`}
            style={{ marginBottom: "10px", display: "inline-flex" }}
          >
            {event.status}
          </span>
          <h2 style={{ marginTop: "8px" }}>{event.title}</h2>
        </div>
        {event.clubId?.name && (
          <div style={{ textAlign: "right" }}>
            <p className="muted" style={{ fontSize: "0.8rem", marginBottom: "4px" }}>
              Organised by
            </p>
            <p style={{ fontWeight: 700, color: "var(--accent)" }}>
              {event.clubId.name}
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <p
          style={{
            color: "var(--text-secondary)",
            lineHeight: "1.7",
            marginBottom: "24px",
            fontSize: "0.97rem",
          }}
        >
          {event.description}
        </p>
      )}

      {/* Detail Rows */}
      <div className="event-detail-row">
        <span className="event-detail-label">📅 When</span>
        <span>
          {new Date(event.date).toLocaleString(undefined, {
            dateStyle: "full",
            timeStyle: "short",
          })}
        </span>
      </div>
      <div className="event-detail-row">
        <span className="event-detail-label">📍 Where</span>
        <span>{event.location}</span>
      </div>
      <div className="event-detail-row">
        <span className="event-detail-label">👥 Seats</span>
        <span>
          <strong
            style={{
              color: isFull ? "var(--danger)" : "var(--accent)",
            }}
          >
            {event.registrationsCount}
          </strong>{" "}
          / {event.maxParticipants} registered
          {isFull && (
            <span
              style={{
                marginLeft: "8px",
                color: "var(--danger)",
                fontWeight: 700,
                fontSize: "0.8rem",
              }}
            >
              FULL
            </span>
          )}
        </span>
      </div>
      {event.createdBy?.name && (
        <div className="event-detail-row">
          <span className="event-detail-label">🙋 Host</span>
          <span>{event.createdBy.name}</span>
        </div>
      )}

      {/* Register Section */}
      <div className="register-section">
        {/* Not logged in */}
        {!user && (
          <p className="muted">
            <Link to="/login" style={{ color: "var(--primary)" }}>
              Login
            </Link>{" "}
            to register for this event
          </p>
        )}

        {/* Student — already registered */}
        {user?.role === "student" && isUpcoming && alreadyRegistered && !message.text && (
          <p style={{ color: "var(--success)", fontWeight: 600 }}>
            ✅ You are registered for this event. Go to{" "}
            <Link to="/dashboard" style={{ color: "var(--accent)" }}>
              Dashboard
            </Link>{" "}
            to manage it.
          </p>
        )}

        {/* Student — can register */}
        {user?.role === "student" && isUpcoming && !alreadyRegistered && !isFull && (
          <button
            className="btn"
            onClick={handleRegister}
            disabled={registering}
          >
            {registering ? "Registering…" : "🎟️ Register Now"}
          </button>
        )}

        {/* Full */}
        {user?.role === "student" && isUpcoming && !alreadyRegistered && isFull && (
          <p className="muted" style={{ color: "var(--danger)", fontWeight: 600 }}>
            ❌ This event is fully booked.
          </p>
        )}

        {/* Past / not upcoming */}
        {user?.role === "student" && !isUpcoming && (
          <p className="muted">Registration is not available for this event.</p>
        )}

        {/* Success / error message */}
        {message.text && (
          <div
            className={`register-message ${
              message.type === "success" ? "toast-success" : "toast-error"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}