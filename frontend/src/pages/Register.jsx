import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../services/auth.jsx";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [clubCode, setClubCode] = useState("");
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  useEffect(() => {
    // Fetch clubs so organizer can pick one by name
    api.get("/clubs")
      .then(({ data }) => setClubs(data.clubs || []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register({
        name,
        email,
        password,
        role,
        ...(role === "organizer" && clubCode ? { clubCode } : {}),
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "2.5rem" }}>🏫</span>
      </div>
      <h2>Create Account</h2>
      <p className="muted" style={{ marginTop: "6px" }}>Join your campus club community</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label>I am a…</label>
          <select value={role} onChange={(e) => { setRole(e.target.value); setClubCode(""); }}>
            <option value="student">Student</option>
            <option value="organizer">Organizer</option>
          </select>
        </div>

        {role === "organizer" && (
          <div className="form-group">
            <label>Club Code (ask your admin)</label>
            <input
              type="text"
              placeholder="e.g. TECHCLUB"
              value={clubCode}
              onChange={(e) => setClubCode(e.target.value.toUpperCase())}
              required
            />
            {clubs.length > 0 && (
              <p className="muted" style={{ fontSize: "0.78rem", marginTop: "4px" }}>
                Available clubs: {clubs.map((c) => <strong key={c._id} style={{ color: "var(--accent)", marginRight: "8px" }}>{c.clubCode}</strong>)}
              </p>
            )}
          </div>
        )}

        {error && <p className="error">⚠️ {error}</p>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="muted" style={{ textAlign: "center", marginTop: "20px" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}