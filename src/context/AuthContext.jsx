import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ensureCsrfToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    Promise.all([ensureCsrfToken(), refreshUser()]).finally(() => setLoading(false));
  }, [refreshUser]);

  const login = async (credentials) => {
    await ensureCsrfToken();
    const { data } = await api.post('/auth/login', credentials);
    setUser(data.user);
  };

  const register = async (values) => {
    await ensureCsrfToken();
    const { data } = await api.post('/auth/register', values);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
