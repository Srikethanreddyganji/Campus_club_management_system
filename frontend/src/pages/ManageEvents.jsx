import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "../services/auth.jsx";

export default function ManageEvents() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    clubId: user?.clubId?._id || user?.clubId || "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const { data } = await api.get("/events");
      setEvents(data.events || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSave(e) {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/events/${editingId}`, form);
      } else {
        await api.post("/events", form);
      }

      setForm({
        title: "",
        description: "",
        date: "",
        location: "",
        clubId:
          user?.clubId?._id ||
          user?.clubId ||
          "",
      });

      setEditingId(null);

      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  }

  function handleEdit(event) {
    setEditingId(event._id);

    setForm({
      title: event.title,
      description: event.description,
      date: new Date(event.date)
        .toISOString()
        .slice(0, 16),
      location: event.location,
      clubId:
        event.clubId?._id ||
        event.clubId,
    });
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <h2>Manage Events</h2>

      <form
        className="card"
        onSubmit={handleSave}
      >
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <input
          type="datetime-local"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
        />

        <button className="btn">
          {editingId
            ? "Update Event"
            : "Create Event"}
        </button>
      </form>

      {loading ? (
        <div className="center">
          Loading...
        </div>
      ) : (
        <div className="grid">
          {events.map((event) => (
            <div
              key={event._id}
              className="card"
            >
              <h3>
                {event.title}
              </h3>

              <p>
                {new Date(
                  event.date
                ).toLocaleString()}
              </p>

              <p>
                {event.location}
              </p>

              <div className="row">
                <button
                  className="btn"
                  onClick={() =>
                    handleEdit(
                      event
                    )
                  }
                >
                  Edit
                </button>

                <button
                  className="btn danger"
                  onClick={() =>
                    handleDelete(
                      event._id
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}