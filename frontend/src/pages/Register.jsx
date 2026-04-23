import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../services/auth.jsx";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [selectedClub, setSelectedClub] = useState("");   // stores club _id
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  useEffect(() => {
    api.get("/clubs")
      .then(({ data }) => setClubs(data.clubs || []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // resolve clubCode from selected club id
    const club = clubs.find((c) => c._id === selectedClub);

    try {
      await register({
        name,
        email,
        password,
        role,
        ...(role === "organizer" && club ? { clubCode: club.clubCode } : {}),
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
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setSelectedClub(""); }}
          >
            <option value="student">Student</option>
            <option value="organizer">Organizer</option>
          </select>
        </div>

        {role === "organizer" && (
          <div className="form-group">
            <label>Select Your Club</label>
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              required
            >
              <option value="">— Choose a club —</option>
              {clubs.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}  ({c.clubCode})
                </option>
              ))}
            </select>
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