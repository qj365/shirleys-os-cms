import { _36_Enums_UserRole, api } from '@/lib/api/admin';
import { initializeAuth, useAuthStore } from '@/lib/stores/authStore';
import { message } from 'antd';
import { useEffect, useLayoutEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPath } from './router-paths';
import SplashScreen from '@/components/SplashScreen';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAppUser, logout, loading, appUser, user } = useAuthStore();

  useLayoutEffect(() => {
    initializeAuth(navigate);
  }, [navigate]);

  useLayoutEffect(() => {
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

    // Only fetch user data if Firebase user is authenticated and not loading
    if (!loading && user && !appUser) {
      getAppUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, loading, user, appUser]);

  // Show loading or nothing while authentication is in progress
  if (loading || !user || !appUser) {
    return <SplashScreen fullScreen />;
  }

  return children;
};
