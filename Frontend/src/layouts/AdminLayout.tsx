import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, LogOut, ArrowDownToLine,
  Menu,
  X,
  Cpu,
  MonitorPlay
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useState } from 'react';

export const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Finances', path: '/admin/finances', icon: CreditCard },
    { name: 'Deposits', path: '/admin/deposits', icon: ArrowDownToLine },
    { name: 'Plans', path: '/admin/plans', icon: Cpu },
    { name: 'Payment Management', path: '/admin/settings', icon: Settings },
    { name: 'Ads', path: '/admin/ads', icon: MonitorPlay },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-slate-900 dark:text-slate-200 font-sans flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-4 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-white/10 sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center transform rotate-3 shadow-lg shadow-red-500/30">
            <Settings size={18} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tight">ADMIN<span className="text-red-500">PANEL</span></span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar (Desktop + Mobile overlay) */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-white/10 z-40 
        transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="hidden md:flex items-center p-6 border-b border-gray-100 dark:border-white/5">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center transform rotate-3 shadow-lg shadow-red-500/30 mr-3">
            <Settings size={20} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight">ADMIN<span className="text-red-500">PANEL</span></span>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = item.path === '/admin' 
              ? location.pathname === '/admin' 
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
                  isActive 
                    ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay background */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full p-4 md:p-8 relative overflow-y-auto min-h-screen">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
