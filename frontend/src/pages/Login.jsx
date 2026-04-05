import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "2.5rem" }}>🎓</span>
      </div>
      <h2>Welcome back</h2>
      <p className="muted" style={{ marginTop: "6px" }}>Sign in to your Campus Club account</p>

      <form onSubmit={handleSubmit}>
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && <p className="error">⚠️ {error}</p>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="muted" style={{ textAlign: "center", marginTop: "20px" }}>
        Don't have an account?{" "}
        <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>
          Create account
        </Link>
      </p>

      {/* Quick login hint */}
      <div style={{
        marginTop: "24px",
        padding: "14px",
        background: "rgba(99,102,241,0.08)",
        borderRadius: "10px",
        border: "1px solid rgba(99,102,241,0.2)",
        fontSize: "0.78rem",
        color: "var(--text-secondary)",
        lineHeight: "1.8"
      }}>
        <strong style={{ color: "var(--text)", display: "block", marginBottom: "4px" }}>🔐 Demo Accounts</strong>
        Admin: <code style={{ color: "var(--accent)" }}>admin@example.com</code> / Admin@123<br />
        Organizer: <code style={{ color: "var(--accent)" }}>organizer@example.com</code> / Organizer@123<br />
        Student: <code style={{ color: "var(--accent)" }}>student@example.com</code> / Student@123
      </div>
    </div>
  );
}