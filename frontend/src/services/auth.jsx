import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      // Optimistically restore user from localStorage immediately
      setUser(JSON.parse(savedUser));

      // Refresh user data from server to get populated clubId
      api
        .get("/users/me")
        .then(({ data }) => {
          const freshUser = data.user;
          localStorage.setItem("user", JSON.stringify(freshUser));
          setUser(freshUser);
        })
        .catch(() => {
          // Token invalid/expired — clear session
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        })
        .finally(() => {
          // Only mark loading done AFTER the async check completes
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", data.token);

    // Fetch fully populated user (includes clubId as object)
    const meRes = await api.get("/users/me");
    const fullUser = meRes.data.user;

    localStorage.setItem("user", JSON.stringify(fullUser));
    setUser(fullUser);

    return fullUser;
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);

    localStorage.setItem("token", data.token);

    // Fetch fully populated user
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
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}