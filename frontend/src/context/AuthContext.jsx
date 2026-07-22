import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

<<<<<<< HEAD
  function login(userData, jwt) {
    setUser(userData)
    setToken(jwt)
    localStorage.setItem('token', jwt)
=======
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
>>>>>>> origin/mayaz-security-integration
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
=======
    <AuthContext.Provider value={{
      user, token, loading,
      isAdmin: user?.role === "admin",
      isTrainee: user?.role === "trainee",
      login, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
>>>>>>> origin/mayaz-security-integration
}

export function useAuth() {
  return useContext(AuthContext)
}