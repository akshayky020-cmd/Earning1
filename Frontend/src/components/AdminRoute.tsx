import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const AdminRoute = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-red-500">403</h1>
          <p className="text-gray-600 dark:text-gray-400">Access Denied: Admin Privileges Required</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

