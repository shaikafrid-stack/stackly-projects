import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("dsm_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("dsm_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/profile")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("dsm_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("dsm_token");
        localStorage.removeItem("dsm_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/login", { email, password });
    localStorage.setItem("dsm_token", data.token);
    localStorage.setItem("dsm_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("dsm_token");
    localStorage.removeItem("dsm_user");
    setUser(null);
  }

  const isAdmin = user?.role === "ADMIN";
  const isAnalyst = user?.role === "ANALYST";

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isAnalyst }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
