import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearAdminSession,
  getAdminToken,
  getStoredAdminUser,
} from '../services/apiClient';
import { getAdminProfile, logoutAdmin } from '../services/authAPI';
import type { User } from '../types/auth';

export function useAdminSession() {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [adminUser, setAdminUser] = useState<User | null>(() => getStoredAdminUser());

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    if (!adminUser) {
      getAdminProfile()
        .then((res) => {
          if (res.data) setAdminUser(res.data);
        })
        .catch(() => {
          // 401/403 is handled by apiClient interceptor
        });
    }
  }, [adminUser]);

  const handleLogout = useCallback(async () => {
    setSigningOut(true);
    await logoutAdmin();
    clearAdminSession();
    setAdminUser(null);
    setSigningOut(false);
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  return {
    adminUser,
    signingOut,
    handleLogout,
  };
}
