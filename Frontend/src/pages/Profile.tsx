import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useTheme } from '../contexts/ThemeContext';
import { CalendarDays, ArrowLeft, Copy, Info, LineChart, History, ShoppingBag, CreditCard, Lock, LogOut, Moon, Sun, ChevronRight, ShieldAlert, PlayCircle, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { logout, updateUser } from '../store/slices/authSlice';
import api from '../lib/api';

export const Profile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/users/profile');
        dispatch(updateUser(res.data));
      } catch (err) {
        console.error("Failed to sync profile:", err);
      }
    };
    fetchProfile();
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { icon: Info, label: 'About Company', path: '/about' },
    { icon: PlayCircle, label: 'Watch & Earn', path: '/watch-earn' },
    { icon: CalendarDays, label: 'Daily Earning', path: '/check-in' },
    { icon: LineChart, label: 'Financial Records', path: '/records/financial' },
    { icon: History, label: 'Withdraw Records', path: '/records/withdraw' },
    { icon: ShoppingBag, label: 'Product History', path: '/records/product' },
    { icon: CreditCard, label: 'Payment Details', path: '/wallet' },
    { icon: Lock, label: 'Change Password', path: '/change-password' },
    { icon: Download, label: 'Download App', path: '/download' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between p-4 sticky top-0 z-10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 dark:bg-[#1e1e1e] rounded-full text-primary-600 shadow-sm md:hidden">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">My Profile</h1>
        <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-full flex items-center font-bold text-sm shadow-sm border border-primary-200 dark:border-primary-500/20">
          <CreditCard size={14} className="mr-1.5" />
          ₹{user?.walletBalance?.toLocaleString() || '0'}
        </div>
      </header>

      <div className="px-4 space-y-4 mt-2">
        {/* Profile Card */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 text-white shadow-lg shadow-primary-500/20 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 right-10 w-24 h-24 bg-black/10 rounded-full blur-xl translate-y-1/2"></div>
          
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-1 shadow-md border-2 border-white/20">
              <div className="w-full h-full border border-primary-200 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl bg-primary-50">
                {user?.name?.charAt(0) || 'S'}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide">{user?.name || 'User'}</h2>
              <div className="flex items-center mt-1 text-primary-100 text-sm font-medium">
                <span className="mr-2">📞 {user?.mobile || 'Not set'}</span>
                <button className="flex items-center bg-white/20 hover:bg-white/30 transition-colors px-2 py-0.5 rounded text-xs backdrop-blur-sm">
                  <Copy size={12} className="mr-1" /> Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex items-center text-primary-600 dark:text-primary-500 mb-2">
              <CreditCard size={16} className="mr-1.5" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Balance</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">₹{user?.walletBalance?.toLocaleString() || '0'}</p>
          </div>
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex items-center text-primary-600 dark:text-primary-500 mb-2">
              <LineChart size={16} className="mr-1.5" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Recharge</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">₹0</p>
          </div>
        </div>

        {/* Menu List */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
          {user?.role === 'admin' && (
            <Link 
              to="/admin/dashboard"
              className="flex items-center justify-between p-4 bg-red-50/30 dark:bg-red-500/5 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-b border-gray-50 dark:border-white/5 text-red-600 dark:text-red-400"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                  <ShieldAlert size={20} />
                </div>
                <span className="font-black text-sm">Admin Panel</span>
              </div>
              <ChevronRight size={18} className="text-red-400" />
            </Link>
          )}
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.path}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-50 dark:border-white/5' : ''
              }`}
            >
              <div className="flex items-center space-x-3 text-gray-800 dark:text-slate-200">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-500">
                  <item.icon size={20} />
                </div>
                <span className="font-semibold text-sm">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>
          ))}
        </div>

        {/* Settings/Theme/Logout */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden mt-4"> 
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-white/5"
          >
            <div className="flex items-center space-x-3 text-gray-800 dark:text-slate-200">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </div>
              <span className="font-semibold text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <LogOut size={20} />
              </div>
              <span className="font-semibold text-sm">Logout</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

