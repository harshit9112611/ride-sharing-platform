import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/auth';

export const AuthContext = createContext(null);

function getStoredAuth() {
  const remember = localStorage.getItem('rememberMe') === 'true';
  const storage = remember ? localStorage : sessionStorage;
  const token = storage.getItem('token') || localStorage.getItem('token');
  const userStr = storage.getItem('user') || localStorage.getItem('user');

  if (!token || !userStr) return { token: null, user: null };

  try {
    return { token, user: JSON.parse(userStr) };
  } catch {
    return { token: null, user: null };
  }
}

function persistAuth(token, user, remember) {
  const storage = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;

  storage.setItem('token', token);
  storage.setItem('user', JSON.stringify(user));
  localStorage.setItem('rememberMe', String(remember));

  other.removeItem('token');
  other.removeItem('user');
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('rememberMe');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
}

export function AuthProvider({ children }) {
  const stored = getStoredAuth();
  const [token, setToken] = useState(stored.token);
  const [user, setUser] = useState(stored.user);
  const [loading, setLoading] = useState(!!stored.token);

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    try {
      const { data } = await authApi.getProfile();
      setUser(data);
      const remember = localStorage.getItem('rememberMe') === 'true';
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(data));
      return data;
    } catch {
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, refreshProfile]);

  const login = useCallback(async (credentials, remember = false) => {
    const { data } = await authApi.login(credentials);
    const userData = {
      userId: data.userId,
      fullName: data.fullName,
      collegeEmail: data.collegeEmail,
    };
    persistAuth(data.token, userData, remember);
    setToken(data.token);
    setUser(userData);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authApi.register(formData);
    const userData = {
      userId: data.userId,
      fullName: data.fullName,
      collegeEmail: data.collegeEmail,
    };
    persistAuth(data.token, userData, true);
    setToken(data.token);
    setUser(userData);
    return data;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    const remember = localStorage.getItem('rememberMe') === 'true';
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: !!token,
      login,
      register,
      logout,
      refreshProfile,
      updateUser,
    }),
    [token, user, loading, login, register, logout, refreshProfile, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
