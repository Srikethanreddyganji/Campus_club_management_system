import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? "var(--text)" : "var(--text-secondary)",
    background: isActive ? "var(--primary-light)" : "transparent",
    padding: "8px 14px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
  });

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/events" className="brand">
        🎓 Campus Clubs
      </Link>

      {/* Nav Links */}
      <div className="nav-links" style={{ display: "flex" }}>
        <NavLink to="/events" style={navLinkStyle} end>
          Events
        </NavLink>

        {user && (
          <NavLink to="/dashboard" style={navLinkStyle}>
            Dashboard
          </NavLink>
        )}

        {user?.role === "organizer" && (
          <NavLink to="/organizer/events" style={navLinkStyle}>
            Manage Events
          </NavLink>
        )}

        {user?.role === "admin" && (
          <>
            <NavLink to="/admin/users" style={navLinkStyle}>
              Users
            </NavLink>
            <NavLink to="/admin/events" style={navLinkStyle}>
              All Events
            </NavLink>
          </>
        )}
      </div>

      {/* Auth Actions */}
      <div className="auth-actions">
        {!user ? (
          <>
            <Link to="/login" style={{ color: "var(--text-secondary)", textDecoration: "none", padding: "8px 14px", fontSize: "0.9rem", fontWeight: 500 }}>
              Sign In
            </Link>
            <Link to="/register" className="btn btn-sm">
              Get Started
            </Link>
          </>
        ) : (
          <>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "6px 14px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "99px",
              border: "1px solid var(--border)",
            }}>
              <div style={{
                width: "26px", height: "26px", borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary), var(--accent))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: "0.75rem", color: "white", flexShrink: 0,
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text)", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name}
              </span>
              <span className={`role-tag role-${user.role}`} style={{ fontSize: "0.65rem" }}>
                {user.role}
              </span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}