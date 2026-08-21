import { useState } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { addUser } from '../store/slices/dataSlice';
import { RootState } from '../store';
import { Phone, Lock, LogIn, ArrowRight } from 'lucide-react';
import api from '../lib/api';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Mobile or Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.data.users);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');

      const identifier = data.identifier.trim();
      const password = data.password.trim();
      const payload = identifier.includes('@')
        ? { email: identifier, password }
        : { mobile: identifier, password };

      console.log('Login attempt:', { identifier, payload });
      const response = await api.post('/api/auth/login', payload);
      console.log('Login response:', response.data);
      const user = response.data;

      dispatch(setCredentials({
        ...user,
        _id: user._id || user.id,
        accessToken: user.token,
        walletBalance: user.walletBalance || 0,
      }));

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      if (err.response?.status === 401) {
        setError('Please register first or enter the correct credentials.');
      } else {
        setError(err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Something went wrong');
      }
    }
  };

  return (
    <div className=" flex items-center justify-center bg-gray-50 dark:bg-[#121212] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#1e1e1e] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6 shadow-sm border border-primary-100 dark:border-primary-500/20">
            <LogIn className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-center text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            Sign in to manage your miners. <br/>
            
          </p>
        </div>
        
        {error && (
          <div className="relative z-10 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm text-center flex items-center justify-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mobile Number or Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('identifier')}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white sm:text-sm transition-all"
                  placeholder="Enter mobile or email"
                  
                />
              </div>
              {errors.identifier && <p className="mt-2 text-xs text-red-500 font-medium">{errors.identifier.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white sm:text-sm transition-all"
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && <p className="mt-2 text-xs text-red-500 font-medium">{errors.password.message}</p>}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg shadow-primary-500/30 text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-95 disabled:opacity-70 disabled:scale-100 group"
            >
              {isSubmitting ? 'Authenticating...' : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
          
          <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
              Register now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
