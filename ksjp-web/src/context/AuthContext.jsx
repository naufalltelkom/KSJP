import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  clearAuthSession,
  fetchMe,
  getStoredToken,
  getStoredUser,
  loginRequest,
  logoutRequest,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [initializing, setInitializing] = useState(() => Boolean(getStoredToken()));

  const syncProfile = useCallback(async () => {
    const activeToken = getStoredToken();
    if (!activeToken) {
      setUser(null);
      setToken(null);
      setInitializing(false);
      return;
    }

    try {
      const res = await fetchMe();
      if (res?.data) {
        setUser(res.data);
        localStorage.setItem('ksjp_auth_user', JSON.stringify(res.data));
      }
    } catch {
      clearAuthSession();
      setToken(null);
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    syncProfile();
  }, [syncProfile]);

  const login = useCallback(async (identifier, password) => {
    const res = await loginRequest(identifier, password);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        initializing,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
        syncProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  }
  return ctx;
}
