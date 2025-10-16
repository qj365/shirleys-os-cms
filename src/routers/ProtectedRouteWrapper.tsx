import { _36_Enums_UserRole, api } from '@/lib/api/admin';
import { initializeAuth, useAuthStore } from '@/lib/stores/authStore';
import { message } from 'antd';
import { useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPath } from './router-paths';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  const navigate = useNavigate();

  const { setAppUser, logout } = useAuthStore();

  useEffect(() => {
    initializeAuth(navigate);
  }, [navigate]);

  useEffect(() => {
    const getAppUser = async () => {
      try {
        const response = await api.admin.adminGetMe();
        if (response?.role !== _36_Enums_UserRole.ADMIN) {
          void message.warning('Permission denied');
          navigate(getPath('login'), { replace: true });
          return;
        }
        setAppUser(response);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.log('Error getting app user', e);

        //redirect to login if status 401, 403,  call logout and redirect to login
        if (e.status === 401 || e.status === 403) {
          await logout();
          navigate(getPath('login'), { replace: true });
          return;
        }
      }
    };
    getAppUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return children;
};
