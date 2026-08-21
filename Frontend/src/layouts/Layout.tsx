import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Users, User, Zap, LogOut, ShieldAlert } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { RootState } from '../store';

export const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Miners', path: '/plans', icon: ShoppingBag },
    { name: 'Team', path: '/team', icon: Users },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-slate-900 dark:text-slate-200 font-sans flex flex-col">
      {/* Desktop Header Navigation */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-white/10 sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center transform rotate-3 shadow-lg shadow-primary-500/30">
            <Zap size={24} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight">EARNING<span className="text-primary-500">1</span></span>
        </div>
        
        <nav className="flex items-center space-x-8">
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="font-semibold text-sm text-red-600 dark:text-red-400 hover:text-red-500 flex items-center space-x-2"
            >
              <ShieldAlert size={18} />
              <span>Admin Panel</span>
            </Link>
          )}
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.name === 'Profile' && location.pathname === '/wallet');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`font-semibold text-sm transition-colors hover:text-primary-500 flex items-center space-x-2 ${
                  isActive ? 'text-primary-500' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors ml-4 pl-4 border-l border-gray-200 dark:border-gray-700"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto md:p-6 pb-24 md:pb-6 relative">
        <div className="md:bg-white md:dark:bg-[#1e1e1e] md:rounded-3xl md:shadow-sm md:border md:border-gray-100 md:dark:border-white/5 md:overflow-hidden min-h-[calc(100vh-120px)] relative">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1e1e1e] border-t border-gray-200 dark:border-white/10 px-6 py-2 pb-6 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.name === 'Profile' && location.pathname === '/wallet');
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center p-2 transition-colors ${
                isActive ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500 hover:text-primary-400'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1">{item.name}</span>
            </Link>
          );
        })}
        
        {/* Center Action Button */}
        <div className="relative -top-6">
          <button onClick={() => navigate('/plans')} className="w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30 text-white border-4 border-slate-50 dark:border-[#121212] transform hover:scale-105 transition-transform">
            <Zap size={24} fill="currentColor" />
          </button>
        </div>
        
        {navItems.slice(2, 4).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.name === 'Profile' && (location.pathname === '/profile' || location.pathname === '/wallet'));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center p-2 transition-colors ${
                isActive ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500 hover:text-primary-400'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
