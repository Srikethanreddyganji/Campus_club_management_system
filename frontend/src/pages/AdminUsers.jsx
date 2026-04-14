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

  async function handleApproveOrganizer(userId, userName) {
    try {
      await api.patch(`/users/${userId}/approve-organizer`);
      showMsg(`✅ Organizer "${userName}" approved!`);
      fetchUsers();
    } catch (err) {
      showMsg("❌ " + (err?.response?.data?.message || "Failed to approve organizer"), "error");
    }
  }

  async function handleRevokeOrganizer(userId, userName) {
    if (!window.confirm(`Revoke organizer access for "${userName}"?`)) return;
    try {
      await api.patch(`/users/${userId}/revoke-organizer`);
      showMsg(`⚠️ Organizer "${userName}" access revoked.`);
      fetchUsers();
    } catch (err) {
      showMsg("❌ " + (err?.response?.data?.message || "Failed to revoke organizer"), "error");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await api.delete(`/users/${id}`);
      showMsg("✅ User deleted.");
      fetchUsers();
    } catch (err) {
      showMsg("❌ " + (err?.response?.data?.message || "Failed to delete user."), "error");
    }
  }

  const roleColors = { admin: "role-admin", organizer: "role-organizer", student: "role-student" };

  // Separate pending organizers for a highlighted section
  const pendingOrganizers = users.filter(u => u.role === "organizer" && !u.organizerApproved);
  const allUsers = users;

  return (
    <div className="admin-users-page">
      <div className="page-header">
        <h2 className="page-title">
          <span className="page-title-icon">👥</span>
          Manage Users
        </h2>
        <p className="page-subtitle">View, edit roles, approve organizers, and manage all registered users</p>
      </div>

      {message.text && (
        <div className={`toast ${message.type === "error" ? "toast-error" : "toast-success"}`}>
          {message.text}
        </div>
      )}

      {/* ===== PENDING ORGANIZER APPROVALS ===== */}
      {pendingOrganizers.length > 0 && (
        <div className="pending-approvals-section" style={{
          background: "linear-gradient(135deg, rgba(255, 159, 67, 0.1), rgba(255, 107, 107, 0.08))",
          border: "1px solid rgba(255, 159, 67, 0.3)",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "28px",
        }}>
          <h3 style={{
            margin: "0 0 16px 0",
            fontSize: "1.15rem",
            color: "#ff9f43",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span>⏳</span> Pending Organizer Approvals
            <span style={{
              background: "#ff9f43",
              color: "#1a1a2e",
              borderRadius: "12px",
              padding: "2px 10px",
              fontSize: "0.8rem",
              fontWeight: "700",
            }}>{pendingOrganizers.length}</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {pendingOrganizers.map((user) => (
              <div key={user._id} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "8px",
                padding: "12px 16px",
                flexWrap: "wrap",
                gap: "10px",
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>{user.name}</span>
                  <span style={{ color: "var(--text-secondary, #999)", fontSize: "0.85rem" }}>{user.email}</span>
                  {user.clubId?.name && (
                    <span style={{ color: "var(--text-secondary, #999)", fontSize: "0.8rem" }}>
                      Club: {user.clubId.name}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn btn-sm"
                    style={{
                      background: "linear-gradient(135deg, #00b894, #00cec9)",
                      color: "#fff",
                      border: "none",
                      fontWeight: "600",
                    }}
                    onClick={() => handleApproveOrganizer(user._id, user.name)}
                  >
                    ✅ Approve
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(user._id)}
                  >
                    🗑️ Reject & Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
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
                <th>Status</th>
                <th>Club</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user._id}>
                  <td className="td-name">{user.name}</td>
                  <td className="td-email muted">{user.email}</td>
                  <td>
                    <span className={`role-tag ${roleColors[user.role] || ""}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.role === "organizer" ? (
                      user.organizerApproved ? (
                        <span style={{
                          color: "#00b894",
                          fontWeight: "600",
                          fontSize: "0.82rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}>✅ Approved</span>
                      ) : (
                        <span style={{
                          color: "#ff9f43",
                          fontWeight: "600",
                          fontSize: "0.82rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}>⏳ Pending</span>
                      )
                    ) : (
                      <span className="muted" style={{ fontSize: "0.82rem" }}>—</span>
                    )}
                  </td>
                  <td className="muted">
                    {user.clubId?.name || user.clubCode || "—"}
                  </td>
                  <td>
                    <div className="row gap-sm" style={{ flexWrap: "wrap" }}>
                      <button
                        className="btn btn-sm"
                        onClick={() => setEditUser({ ...user, clubId: user.clubId?._id || "" })}
                      >
                        Edit
                      </button>

                      {/* Approve / Revoke for organizers */}
                      {user.role === "organizer" && !user.organizerApproved && (
                        <button
                          className="btn btn-sm"
                          style={{
                            background: "linear-gradient(135deg, #00b894, #00cec9)",
                            color: "#fff",
                            border: "none",
                          }}
                          onClick={() => handleApproveOrganizer(user._id, user.name)}
                        >
                          Approve
                        </button>
                      )}
                      {user.role === "organizer" && user.organizerApproved && (
                        <button
                          className="btn btn-sm"
                          style={{
                            background: "linear-gradient(135deg, #e17055, #d63031)",
                            color: "#fff",
                            border: "none",
                          }}
                          onClick={() => handleRevokeOrganizer(user._id, user.name)}
                        >
                          Revoke
                        </button>
                      )}

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