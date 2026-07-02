import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      try { setUser(JSON.parse(storedUser)); }
      catch { localStorage.removeItem("user"); }
    }
    setLoading(false);
  }, []);

  function persist(userData, jwt) {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(userData));
  }

  function clear() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  async function login(email, password) {
    const { user: userData, token: jwt } = await authAPI.login(email, password);
    persist(userData, jwt);
    return userData;
  }

  function logout() {
    clear();
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isAdmin: user?.role === "admin",
      isTrainee: user?.role === "trainee",
      login, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
