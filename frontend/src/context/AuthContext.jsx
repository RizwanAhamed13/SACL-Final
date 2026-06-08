import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      const userObj = JSON.parse(storedUser);
      setUser(userObj);
      scheduleExpiryWarning(token);
    }
    setLoading(false);
  }, []);

  const decodeJwtPayload = (token) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  };

  const scheduleExpiryWarning = (token) => {
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.exp) return;

    const expiresAt = payload.exp * 1000;
    const warnAt = expiresAt - 5 * 60 * 1000; // 5 minutes before expiry
    const delay = warnAt - Date.now();

    if (delay > 0) {
      setTimeout(() => {
        toast('Session expiring in 5 minutes — please save your work', { duration: 10000 });
      }, delay);
    }
  };

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    scheduleExpiryWarning(token);
  };

  const logout = async () => {
    // BUG-005: Blacklist token on server before clearing local state
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* ignore network errors — still clear local state */ }
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
