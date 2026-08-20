import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const userData = await api.get('/users/me');
      const r = userData.role || 'STUDENT';
      setUser(userData);
      setRole(r);
      return r;
    } catch (e) {
      // Token invalid or expired
      logout();
    }
    return null;
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token') || sessionStorage.getItem('sp_token');
    if (savedToken) {
      localStorage.setItem('token', savedToken);
      sessionStorage.setItem('sp_token', savedToken);
      setToken(savedToken);
      loadProfile();
    }
    setLoading(false);
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    sessionStorage.setItem('sp_token', newToken);
    setToken(newToken);
    if (userData) {
      setUser(userData);
      setRole(userData.role || 'STUDENT');
      return userData.role || 'STUDENT';
    }
    return loadProfile();
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('sp_token');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const isAuthenticated = !!token;
  const isInstructor = role === 'INSTRUCTOR';
  const isAdmin = role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ token, user, role, isInstructor, isAdmin, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}