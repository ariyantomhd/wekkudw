// src/hooks/useAdminSession.ts
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  clearAdminSession,
  getAdminToken,
  getStoredAdminUser,
  isPreviewSessionActive,
} from '../services/apiClient';
import { getAdminProfile, logoutAdmin } from '../services/authAPI';
import type { User } from '../types/auth';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export function useAdminSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const [signingOut, setSigningOut] = useState(false);
  const [adminUser, setAdminUser] = useState<User | null>(() => getStoredAdminUser());
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let active = true;
    const token = getAdminToken();
    const isPreview = isPreviewSessionActive();

    if (!token && !isPreview) {
      if (active) {
        setAuthStatus('unauthenticated');
        if (!location.pathname.includes('/admin/login')) {
          navigate('/admin/login', { replace: true });
        }
      }
      return;
    }

    if (token && !adminUser) {
      getAdminProfile()
        .then((res) => {
          if (!active) return;
          if (res.data) setAdminUser(res.data);
          setAuthStatus('authenticated');
        })
        .catch(() => {
          if (!active) return;
          setAuthStatus('unauthenticated');
        });
    } else {
      setAuthStatus('authenticated');
    }

    return () => {
      active = false;
    };
  }, [adminUser, location.pathname, navigate]);

  const handleLogout = useCallback(async () => {
    setSigningOut(true);
    await logoutAdmin();
    clearAdminSession();
    setAdminUser(null);
    setAuthStatus('unauthenticated');
    setSigningOut(false);
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  return {
    adminUser,
    authStatus,
    isSessionReady: authStatus === 'authenticated',
    signingOut,
    handleLogout,
  };
}