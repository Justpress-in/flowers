import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { userAuth } from '../api/endpoints';
import {
  getAccessToken,
  getStoredProfile,
  getStoredRefreshToken,
  clearSession,
  setSession,
} from '../api/client';

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredProfile('user'));
  const [bootstrapping, setBootstrapping] = useState(true);
  const [authModal, setAuthModal] = useState(null); // { mode, next }

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const hasToken = !!getAccessToken('user');
      const hasRefresh = !!getStoredRefreshToken('user');
      if (!hasToken && !hasRefresh) {
        if (!cancelled) setBootstrapping(false);
        return;
      }
      try {
        const { user: me } = await userAuth.me();
        if (!cancelled) {
          setUser(me);
          setSession('user', { profile: me });
        }
      } catch {
        if (!cancelled) {
          clearSession('user');
          setUser(null);
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    }
    bootstrap();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await userAuth.login(email, password);
    userAuth.applySession(data);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (body) => {
    const data = await userAuth.register(body);
    userAuth.applySession(data);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await userAuth.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (body) => {
    const { user: updated } = await userAuth.updateProfile(body);
    setUser(updated);
    setSession('user', { profile: updated });
    return updated;
  }, []);

  const openAuthModal = useCallback((opts = {}) => {
    setAuthModal({ mode: opts.mode || 'login', next: opts.next || null });
  }, []);
  const closeAuthModal = useCallback(() => setAuthModal(null), []);

  return (
    <UserAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        bootstrapping,
        login,
        register,
        logout,
        updateProfile,
        authModal,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be used within a UserAuthProvider');
  return ctx;
}
