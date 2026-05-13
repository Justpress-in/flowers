import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth as authApi } from '../api/endpoints';
import {
  getAccessToken,
  getStoredProfile,
  getStoredRefreshToken,
  clearSession,
  setSession,
} from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => getStoredProfile('admin'));
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const hasToken = !!getAccessToken('admin');
      const hasRefresh = !!getStoredRefreshToken('admin');
      if (!hasToken && !hasRefresh) {
        if (!cancelled) setBootstrapping(false);
        return;
      }
      try {
        const { admin: me } = await authApi.me();
        if (!cancelled) {
          setAdmin(me);
          setSession('admin', { profile: me });
        }
      } catch {
        if (!cancelled) {
          clearSession('admin');
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

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        bootstrapping,
        login,
        logout,
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
