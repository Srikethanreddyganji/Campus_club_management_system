import { Navigate } from "react-router-dom";

import Loader from "./Loader.jsx";
import { useAuth } from "../services/auth.jsx";

export default function ProtectedRoute({
  children,
  roles,
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    roles &&
    !roles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  /* Block unapproved organizers from organizer-only routes */
  if (
    roles &&
    roles.includes("organizer") &&
    user.role === "organizer" &&
    !user.organizerApproved
  ) {
    return (
      <div className="access-denied-page">
        <div className="access-denied-card">
          <div className="access-denied-icon">🔒</div>
          <h2>Access Pending Approval</h2>
          <p className="muted">
            Your organizer account is awaiting admin approval. You'll be able to
            manage events and view participants once an administrator approves
            your request.
          </p>
          <div className="access-denied-info">
            <div className="info-row">
              <span className="info-label">Account</span>
              <span>{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Role</span>
              <span className="role-tag role-organizer">organizer</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status</span>
              <span className="status-badge status-pending">⏳ Pending Approval</span>
            </div>
          </div>
          <p className="muted" style={{ fontSize: "0.8rem", marginTop: "16px" }}>
            Please contact your campus administrator for approval.
          </p>
        </div>
      </div>
    );
  }

  return children;
}