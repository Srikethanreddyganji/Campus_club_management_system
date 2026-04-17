import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "./api.js";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      setLoading(false);
      return;
    }

    /* hydrate immediately from localStorage so ProtectedRoute doesn't flash */
    setUser(JSON.parse(savedUser));

    /* then refresh from server for up-to-date data (populated clubId, approval) */
    api.get("/users/me")
      .then(({ data }) => {
        const freshUser = data.user;
        localStorage.setItem("user", JSON.stringify(freshUser));
        setUser(freshUser);
      })
      .catch(() => {
        /* Token invalid/expired — clear session */
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", data.token);

    /* Fetch fully populated user (includes clubId as object, approval status) */
    const meRes = await api.get("/users/me");
    const fullUser = meRes.data.user;

    localStorage.setItem("user", JSON.stringify(fullUser));
    setUser(fullUser);

    return fullUser;
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);

    localStorage.setItem("token", data.token);

    /* Fetch fully populated user */
    const meRes = await api.get("/users/me");
    const fullUser = meRes.data.user;

    localStorage.setItem("user", JSON.stringify(fullUser));
    setUser(fullUser);

    return fullUser;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }

  /* Helper to refresh user data after admin does approval etc. */
  async function refreshUser() {
    try {
      const { data } = await api.get("/users/me");
      const freshUser = data.user;
      localStorage.setItem("user", JSON.stringify(freshUser));
      setUser(freshUser);
    } catch {
      /* ignore silently */
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}