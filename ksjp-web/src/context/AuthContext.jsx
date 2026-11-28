import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  clearAuthSession,
  fetchMe,
  getStoredToken,
  getStoredUser,
  loginRequest,
  logoutRequest,
  registerRequest,
  setAuthSession,
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

  const login = useCallback(async (identifier, password, { deferCommit = false } = {}) => {
    const res = await loginRequest(identifier, password);
    if (!deferCommit) {
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  }, []);

  const register = useCallback(async (payload, { deferCommit = false } = {}) => {
    const res = await registerRequest(payload);
    if (!deferCommit) {
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  }, []);

  const commitAuth = useCallback((authData) => {
    if (authData?.token && authData?.user) {
      setAuthSession(authData.token, authData.user);
      setToken(authData.token);
      setUser(authData.user);
    }
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
        register,
        commitAuth,
        logout,
        syncProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
