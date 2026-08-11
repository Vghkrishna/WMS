import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('wms_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { token, user: profile } = data.data;
      localStorage.setItem('wms_token', token);
      localStorage.setItem('wms_user', JSON.stringify(profile));
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('wms_token');
    localStorage.removeItem('wms_user');
    setUser(null);
  }, []);

  // Role helpers used throughout the UI for conditional rendering.
  const can = useMemo(
    () => ({
      manageProducts: ['admin', 'manager'].includes(user?.role),
      moveStock: ['admin', 'manager'].includes(user?.role),
      deleteProducts: user?.role === 'admin',
      manageUsers: user?.role === 'admin',
    }),
    [user]
  );

  const value = useMemo(
    () => ({ user, loading, login, logout, can, isAuthenticated: !!user }),
    [user, loading, login, logout, can]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
