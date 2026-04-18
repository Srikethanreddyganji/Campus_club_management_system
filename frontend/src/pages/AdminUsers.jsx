import { useEffect, useState } from "react";
import api from "../services/api.js";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchUsers();
    fetchClubs();
  }, []);

  async function fetchUsers() {
    try {
      const { data } = await api.get("/users");
      setUsers(data.users || []);
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

  function showMsg(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3500);
  }

  async function handleSave() {
    try {
      const { _id, ...body } = editUser;
      // Only send allowed fields
      const payload = {
        name: body.name,
        role: body.role,
      };
      if (body.clubId && body.clubId !== "") {
        payload.clubId = body.clubId;
      }
      await api.put(`/users/${_id}`, payload);
      setEditUser(null);
      showMsg("✅ User updated successfully!");
      fetchUsers();
    } catch (err) {
      showMsg("❌ " + (err?.response?.data?.message || "Failed to update user"), "error");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await api.delete(`/users/${id}`);
      showMsg("✅ User deleted.");
      fetchUsers();
    } catch (err) {
      showMsg("❌ Failed to delete user.", "error");
    }
  }

  const roleColors = { admin: "role-admin", organizer: "role-organizer", student: "role-student" };

  return (
    <div className="admin-users-page">
      <div className="page-header">
        <h2 className="page-title">
          <span className="page-title-icon">👥</span>
          Manage Users
        </h2>
        <p className="page-subtitle">View, edit roles, and manage all registered users</p>
      </div>

      {message.text && (
        <div className={`toast ${message.type === "error" ? "toast-error" : "toast-success"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="center-loader">
          <div className="spinner" />
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Club</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="td-name">{user.name}</td>
                  <td className="td-email muted">{user.email}</td>
                  <td>
                    <span className={`role-tag ${roleColors[user.role] || ""}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="muted">
                    {user.clubId?.name || user.clubCode || "—"}
                  </td>
                  <td>
                    <div className="row gap-sm">
                      <button
                        className="btn btn-sm"
                        onClick={() => setEditUser({ ...user, clubId: user.clubId?._id || "" })}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(user._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="modal-close" onClick={() => setEditUser(null)}>✕</button>
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Assign to Club</label>
              <select
                value={editUser.clubId || ""}
                onChange={(e) => setEditUser({ ...editUser, clubId: e.target.value })}
              >
                <option value="">— None —</option>
                {clubs.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.clubCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button className="btn" onClick={handleSave}>
                Save Changes
              </button>
              <button className="btn btn-ghost" onClick={() => setEditUser(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}