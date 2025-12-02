import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, user } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/rooms" replace />;
  }

  return <>{children}</>;
};
