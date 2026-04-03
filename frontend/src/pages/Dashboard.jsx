import { Link } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h2>
        Welcome, {user?.name}
      </h2>

      <p className="role-text">
        Logged in as: {user?.role}
      </p>

      <div className="grid">
        <Link
          to="/events"
          className="card"
        >
          Browse Events
        </Link>

        {user?.role ===
          "student" && (
          <Link
            to="/dashboard"
            className="card"
          >
            My Registrations
          </Link>
        )}

        {user?.role ===
          "organizer" && (
          <>
            <Link
              to="/organizer/events"
              className="card"
            >
              Manage Events
            </Link>

            <Link
              to="/events"
              className="card"
            >
              View Participants
            </Link>
          </>
        )}

        {user?.role ===
          "admin" && (
          <>
            <Link
              to="/admin/users"
              className="card"
            >
              Manage Users
            </Link>

            <Link
              to="/admin/events"
              className="card"
            >
              Manage All Events
            </Link>

            <Link
              to="/events"
              className="card"
            >
              View All Registrations
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
