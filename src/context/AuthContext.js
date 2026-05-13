import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth as authApi } from '../api/endpoints';
import {
  getAccessToken,
  getStoredAdmin,
  getStoredRefreshToken,
  clearSession,
} from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => getStoredAdmin());
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const hasToken = !!getAccessToken();
      const hasRefresh = !!getStoredRefreshToken();
      if (!hasToken && !hasRefresh && !document.cookie.includes('refreshToken')) {
        if (!cancelled) setBootstrapping(false);
        return;
      }
      try {
        const { admin: me } = await authApi.me();
        if (!cancelled) {
          setAdmin(me);
          try { localStorage.setItem('bn_admin', JSON.stringify(me)); } catch {}
        }
      } catch {
        if (!cancelled) {
          clearSession();
          setAdmin(null);
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    }
    bootstrap();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    authApi.applyLogin(data);
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setAdmin(null);
  }, []);

  const refreshAdmin = useCallback(async () => {
    try {
      const { admin: me } = await authApi.me();
      setAdmin(me);
      try { localStorage.setItem('bn_admin', JSON.stringify(me)); } catch {}
      return me;
    } catch {
      setAdmin(null);
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        bootstrapping,
        login,
        logout,
        refreshAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
