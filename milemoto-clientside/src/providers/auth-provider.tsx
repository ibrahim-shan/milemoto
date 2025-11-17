'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { logout as apiLogout, getMe, refresh } from '@/lib/auth';
import {
  applyLoginResult,
  clearAuth,
  getAccessToken,
  getUser,
  setAccessToken,
  setUser as setStoredUser,
  subscribe,
} from '@/lib/authStorage';
import type { UserDto } from '@/types';

type SessionPayload = { accessToken: string; user: UserDto };

type AuthContextValue = {
  user: UserDto | null;
  accessToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  setSession: (payload: SessionPayload) => void;
  refreshSession: () => Promise<void>;
  updateUser: (updater: (prev: UserDto | null) => UserDto | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUserState] = useState<UserDto | null>(() => getUser<UserDto>());
  const [accessToken, setAccessTokenState] = useState<string | null>(() => getAccessToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setUserState(getUser<UserDto>());
      setAccessTokenState(getAccessToken());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      try {
        if (!getAccessToken()) {
          const { accessToken: refreshed } = await refresh();
          if (!refreshed || cancelled) {
            clearAuth();
            setAccessTokenState(null);
            setUserState(null);
            return;
          }
          setAccessToken(refreshed);
          setAccessTokenState(refreshed);
        }
        if (!getUser<UserDto>()) {
          const me = await getMe();
          if (cancelled) return;
          setStoredUser(me);
          setUserState(me);
        }
      } catch {
        if (!cancelled) {
          clearAuth();
          setAccessTokenState(null);
          setUserState(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const setSession = useCallback((payload: SessionPayload) => {
    applyLoginResult(payload);
    setAccessTokenState(payload.accessToken);
    setUserState(payload.user);
  }, []);

  const refreshSession = useCallback(async () => {
    const { accessToken: refreshed } = await refresh();
    if (!refreshed) {
      throw new Error('Unable to refresh session');
    }
    setAccessToken(refreshed);
    setAccessTokenState(refreshed);
    const me = await getMe();
    setStoredUser(me);
    setUserState(me);
  }, []);

  const updateUser = useCallback((updater: (prev: UserDto | null) => UserDto | null) => {
    setUserState(prev => {
      const next = updater(prev);
      setStoredUser(next);
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      clearAuth();
      setAccessTokenState(null);
      setUserState(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      loading,
      isAuthenticated: Boolean(user && accessToken),
      setSession,
      refreshSession,
      updateUser,
      logout,
    }),
    [user, accessToken, loading, setSession, refreshSession, updateUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
