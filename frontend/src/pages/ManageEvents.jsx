import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "../services/auth.jsx";

export default function ManageEvents() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [editingId, setEditingId] = useState(null);

  /* participants panel state */
  const [participants, setParticipants] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  /* resolve user's clubId regardless of populated vs raw */
  const myClubId = user?.clubId?._id || user?.clubId || "";

  const defaultForm = {
    title: "",
    description: "",
    date: "",
    location: "",
    maxParticipants: 100,
    clubId: myClubId,
  };

  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    fetchEvents();
    if (user?.role === "admin") fetchClubs();
  }, []);

  /* when user loads / updates, refresh organizer's clubId in form */
  useEffect(() => {
    if (user?.role === "organizer") {
      setForm((prev) => ({ ...prev, clubId: myClubId }));
    }
  }, [user]);

  async function fetchEvents() {
    try {
      const { data } = await api.get("/events");
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClubs() {
    try {
      const { data } = await api.get("/clubs");
      setClubs(data.clubs || []);
    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function showMsg(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3500);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);

    const payload = { ...form };

    /* organizer always uses their own club */
    if (user?.role === "organizer") {
      payload.clubId = myClubId;
    }

    if (!payload.clubId) {
      showMsg("❌ No club associated with your account. Contact an admin.", "error");
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        await api.put(`/events/${editingId}`, payload);
        showMsg("✅ Event updated successfully!");
      } else {
        await api.post("/events", payload);
        showMsg("✅ Event created successfully!");
      }
      resetForm();
      fetchEvents();
    } catch (err) {
      showMsg(
        "❌ " +
          (err?.response?.data?.message ||
            err?.response?.data?.errors?.[0]?.msg ||
            "Failed to save event"),
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm({ ...defaultForm, clubId: myClubId });
    setEditingId(null);
  }

  function handleEdit(event) {
    setEditingId(event._id);
    setForm({
      title: event.title,
      description: event.description || "",
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location,
      maxParticipants: event.maxParticipants || 100,
      clubId: event.clubId?._id || event.clubId || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this event? This cannot be undone.")) return;
    try {
      await api.delete(`/events/${id}`);
      showMsg("✅ Event deleted.");
      if (editingId === id) resetForm();
      if (selectedEventId === id) setSelectedEventId(null);
      fetchEvents();
    } catch (err) {
      showMsg("❌ " + (err?.response?.data?.message || "Failed to delete event."), "error");
    }
  }

  async function viewParticipants(id) {
    if (id === selectedEventId) {
      setSelectedEventId(null);
      return;
    }
    setSelectedEventId(id);
    setLoadingParticipants(true);
    try {
      const { data } = await api.get(`/events/${id}/participants`);
      setParticipants(data.participants || []);
    } catch (err) {
      console.error("Failed to fetch participants:", err);
      showMsg("❌ " + (err?.response?.data?.message || "Failed to load participants."), "error");
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  }

  /* organizer sees only their club's events; admin sees all */
  const filteredEvents =
    user?.role === "organizer"
      ? events.filter((e) => {
          const eClub = e.clubId?._id || e.clubId;
          return eClub?.toString() === myClubId?.toString();
        })
      : events;

  return (
    <div className="manage-events-page">
      <div className="page-header">
        <h2 className="page-title">
          <span className="page-title-icon">🗓️</span>
          {user?.role === "admin" ? "Manage All Events" : "Manage Your Events"}
        </h2>
        <p className="page-subtitle">
          {user?.role === "admin"
            ? "Create and moderate events across all clubs"
            : myClubId
            ? "Create and manage events for your club"
            : "⚠️ No club assigned to your account. Ask an admin to assign you to a club first."}
        </p>
      </div>

      {/* Toast */}
      {message.text && (
        <div
          className={`toast ${message.type === "error" ? "toast-error" : "toast-success"}`}
        >
          {message.text}
        </div>
      )}

      {/* CREATE / EDIT FORM */}
      <div className="form-card">
        <h3 className="form-title">
          {editingId ? "✏️ Edit Event" : "➕ Create New Event"}
        </h3>
        <form onSubmit={handleSave} className="event-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Event Title *</label>
              <input
                name="title"
                placeholder="e.g. Annual Tech Symposium"
                value={form.title}
                onChange={handleChange}
                required
                minLength={3}
              />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                name="location"
                placeholder="e.g. Main Auditorium"
                value={form.location}
                onChange={handleChange}
                required
                minLength={2}
              />
            </div>

            <div className="form-group">
              <label>Date &amp; Time *</label>
              <input
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Max Participants</label>
              <input
                type="number"
                name="maxParticipants"
                min="1"
                value={form.maxParticipants}
                onChange={handleChange}
              />
            </div>

            {/* Club selector — admin only */}
            {user?.role === "admin" && (
              <div className="form-group">
                <label>Club *</label>
                <select
                  name="clubId"
                  value={form.clubId}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Select Club —</option>
                  {clubs.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Show organizer's club read-only */}
            {user?.role === "organizer" && user?.clubId && (
              <div className="form-group">
                <label>Club</label>
                <input
                  value={user.clubId?.name || "Your Club"}
                  disabled
                  style={{ opacity: 0.6 }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe the event..."
              rows={3}
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button
              className="btn"
              type="submit"
              disabled={saving || (user?.role === "organizer" && !myClubId)}
            >
              {saving ? "Saving..." : editingId ? "Update Event" : "Create Event"}
            </button>
            {editingId && (
              <button className="btn btn-ghost" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* EVENT LIST */}
      <div className="section-header">
        <h3 className="section-title">
          {filteredEvents.length} Event{filteredEvents.length !== 1 ? "s" : ""}
        </h3>
      </div>

      {loading ? (
        <div className="center-loader">
          <div className="spinner" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗓️</div>
          <p>No events yet. Create your first event above!</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div key={event._id} className="event-card">
              <div className="event-card-top">
                <span className={`status-badge status-${event.status}`}>
                  {event.status}
                </span>
                <p className="event-club">{event.clubId?.name}</p>
              </div>
              <h3 className="event-card-title">{event.title}</h3>
              <div className="event-meta">
                <span>📅 {new Date(event.date).toLocaleString()}</span>
                <span>📍 {event.location}</span>
                <span>
                  👥 {event.registrationsCount} / {event.maxParticipants} registered
                </span>
              </div>
              <div className="event-card-actions">
                <button className="btn btn-sm" onClick={() => handleEdit(event)}>
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => viewParticipants(event._id)}
                >
                  {selectedEventId === event._id ? "Hide" : "👥 Participants"}
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(event._id)}
                >
                  Delete
                </button>
              </div>

              {/* Participants Panel */}
              {selectedEventId === event._id && (
                <div className="participants-panel">
                  <h4>👥 Registered Participants</h4>
                  {loadingParticipants ? (
                    <div className="center-loader" style={{ padding: "16px 0" }}>
                      <div className="spinner" />
                    </div>
                  ) : participants.length === 0 ? (
                    <p className="muted">No participants registered yet.</p>
                  ) : (
                    <ul className="participants-list">
                      {participants.map((p) => (
                        <li key={p._id}>
                          <span className="participant-name">{p.userId?.name || "Unknown"}</span>
                          <span className="participant-email muted">{p.userId?.email || "—"}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}