import { useEffect, useState } from "react";
import api from "../services/api.js";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [editingId, setEditingId] = useState(null);

  const defaultForm = {
    title: "",
    description: "",
    date: "",
    location: "",
    maxParticipants: 100,
    clubId: "",
    status: "upcoming",
  };
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    fetchEvents();
    fetchClubs();
  }, []);

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
    try {
      if (editingId) {
        await api.put(`/events/${editingId}`, form);
        showMsg("✅ Event updated successfully!");
      } else {
        await api.post("/events", form);
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
    setForm(defaultForm);
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
      status: event.status || "upcoming",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function viewParticipants(id) {
    try {
      setSelectedEventId(id === selectedEventId ? null : id);
      if (id === selectedEventId) return;
      const { data } = await api.get(`/events/${id}/participants`);
      setParticipants(data.participants || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this event permanently?")) return;
    try {
      await api.delete(`/events/${id}`);
      showMsg("✅ Event deleted.");
      if (selectedEventId === id) setSelectedEventId(null);
      fetchEvents();
    } catch (err) {
      showMsg("❌ Failed to delete event.", "error");
    }
  }

  return (
    <div className="manage-events-page">
      <div className="page-header">
        <h2 className="page-title">
          <span className="page-title-icon">🛡️</span>
          Admin — All Events
        </h2>
        <p className="page-subtitle">Full control over all club events across the campus</p>
      </div>

      {message.text && (
        <div className={`toast ${message.type === "error" ? "toast-error" : "toast-success"}`}>
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
              />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                name="location"
                placeholder="e.g. Main Hall"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Date & Time *</label>
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

            {editingId && (
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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
            <button className="btn" type="submit" disabled={saving}>
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
        <h3 className="section-title">All Events ({events.length})</h3>
      </div>

      {loading ? (
        <div className="center-loader">
          <div className="spinner" />
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗓️</div>
          <p>No events found. Create the first one above!</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
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
                <span>👥 Max: {event.maxParticipants}</span>
              </div>
              <div className="event-card-actions">
                <button className="btn btn-sm" onClick={() => handleEdit(event)}>
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => viewParticipants(event._id)}
                >
                  {selectedEventId === event._id ? "Hide" : "Participants"}
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(event._id)}
                >
                  Delete
                </button>
              </div>

              {selectedEventId === event._id && (
                <div className="participants-panel">
                  <h4>👥 Registered Participants</h4>
                  {participants.length === 0 ? (
                    <p className="muted">No participants yet.</p>
                  ) : (
                    <ul className="participants-list">
                      {participants.map((p) => (
                        <li key={p._id}>
                          <span className="participant-name">{p.userId?.name}</span>
                          <span className="participant-email muted">{p.userId?.email}</span>
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