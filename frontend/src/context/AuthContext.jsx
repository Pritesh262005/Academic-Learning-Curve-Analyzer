import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchMe, login as loginApi, register as registerApi } from '../services/auth';
import { getStoredUser, getToken, setStoredUser, setToken } from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [bootstrapping, setBootstrapping] = useState(true);

  const setSession = useCallback((nextToken, nextUser) => {
    setTokenState(nextToken);
    setUser(nextUser);
    setToken(nextToken);
    setStoredUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    setSession(null, null);
    toast.success('Logged out');
  }, [setSession]);

  const refresh = useCallback(async () => {
    if (!getToken()) return;
    try {
      const { user: me } = await fetchMe();
      setSession(getToken(), me);
    } catch {
      setSession(null, null);
    }
  }, [setSession]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (ignore) return;
      await refresh();
      setBootstrapping(false);
    })();
    return () => {
      ignore = true;
    };
  }, [refresh]);

  const login = useCallback(
    async (payload) => {
      const { token: t, user: u } = await loginApi(payload);
      setSession(t, u);
      toast.success(`Welcome, ${u.name}`);
      return u;
    },
    [setSession]
  );

  const register = useCallback(
    async (payload) => {
      const { token: t, user: u } = await registerApi(payload);
      setSession(t, u);
      toast.success('Account created');
      return u;
    },
    [setSession]
  );

  const value = useMemo(
    () => ({ token, user, bootstrapping, isAuthenticated: !!token && !!user, login, register, logout, refresh }),
    [token, user, bootstrapping, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

