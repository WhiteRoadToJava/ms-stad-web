import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { request } from '../../lib/api';
import { adminApi, setAccessToken, setSessionLostHandler } from '../../lib/adminApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState('loading');

  const clear = useCallback(() => {
    setAccessToken(null);
    setAdmin(null);
    setStatus('anonymous');
  }, []);

  // On a reload there is no token in memory, but the refresh cookie may still
  // be valid, so the session is restored rather than asking for the password
  // again on every refresh of the page.
  useEffect(() => {
    setSessionLostHandler(clear);

    request('/admin/auth/refresh', { method: 'POST' })
      .then((payload) => {
        setAccessToken(payload.data.accessToken);
        setAdmin(payload.data.admin);
        setStatus('authenticated');
      })
      .catch(() => setStatus('anonymous'));
  }, [clear]);

  const login = useCallback(async (credentials) => {
    const payload = await request('/admin/auth/login', {
      method: 'POST',
      body: credentials,
    });

    setAccessToken(payload.data.accessToken);
    setAdmin(payload.data.admin);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    await request('/admin/auth/logout', { method: 'POST' }).catch(() => {});
    clear();
  }, [clear]);

  const changePassword = useCallback(async (values) => {
    await adminApi.post('/admin/auth/password', values);
    setAdmin((current) => ({ ...current, mustChangePassword: false }));
  }, []);

  const value = useMemo(
    () => ({ admin, status, login, logout, changePassword }),
    [admin, status, login, logout, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
