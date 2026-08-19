import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const ProtectedRoute = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const hasToken = Boolean(sessionStorage.getItem('token'));

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};
