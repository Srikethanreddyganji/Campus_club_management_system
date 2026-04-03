import { useState } from "react";
import {
  useNavigate,
  Link,
} from "react-router-dom";

import { useAuth } from "../services/auth.jsx";

export default function Register() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("student");

  const [clubId, setClubId] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const navigate =
    useNavigate();

  const { register } =
    useAuth();

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
			clubCode:
			  role ===
			  "organizer"
				? clubId
				: null,
		  });
	  
		  navigate("/dashboard");
		} catch (error) {
		  setError(
			error?.response?.data
			  ?.message ||
			  "Registration failed"
		  );
		} finally {
		  setLoading(false);
		}
	  }

  return (
    <div className="card auth-card">
      <h2>Register</h2>

      <form
        onSubmit={
          handleSubmit
        }
      >
        <input
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
          required
        />

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          required
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          required
        />

        <label>
          Role
        </label>

        <select
          value={role}
          onChange={(e) =>
            setRole(
              e.target.value
            )
          }
        >
          <option value="student">
            Student
          </option>

          <option value="organizer">
            Organizer
          </option>
        </select>

        {role ===
          "organizer" && (
          <input
            type="text"
            placeholder="Enter Club ID"
            value={clubId}
            onChange={(e) =>
              setClubId(
                e.target.value
              )
            }
            required
          />
        )}

        <button
          className="btn"
          disabled={
            loading
          }
        >
          {loading
            ? "Registering..."
            : "Register"}
        </button>

        {error && (
          <p className="error">
            {error}
          </p>
        )}
      </form>

      <p className="muted">
        Already have an
        account?{" "}
        <Link to="/login">
          Login
        </Link>
      </p>
    </div>
  );
}