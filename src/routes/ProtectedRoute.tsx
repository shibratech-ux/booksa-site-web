import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ROUTES } from '@/utils/constants';
import { useAuthStore } from '@/store/auth.store';

export function ProtectedRoute() {
  const { isAuthenticated, status } = useAuthStore();
  const location = useLocation();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
