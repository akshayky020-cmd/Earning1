import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { addUser } from '../store/slices/dataSlice';
import { User as UserIcon, Phone, Lock, Gift, Shield, Zap, Award, ArrowRight, UserPlus, Mail } from 'lucide-react';
import api from '../lib/api';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Please enter a valid email'),
  mobile: z.string().regex(/^[0-9]{10}$/, 'Must be a 10-digit number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  referralCode: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export const Register = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('');

      const response = await api.post('/api/auth/register', {
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        password: data.password,
        referralCode: data.referralCode,
      });

      const user = response.data;
      dispatch(addUser({
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        status: 'active',
        balance: user.walletBalance || 0,
        joinDate: new Date().toISOString().split('T')[0]
      }));

      dispatch(setCredentials({
        ...user,
        _id: user._id,
        accessToken: user.token,
        walletBalance: user.walletBalance || 0,
      }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error?.message || 'Something went wrong');
    }
  };

  return (
    <div className=" flex flex-col md:flex-row bg-gray-50 dark:bg-[#121212] transition-colors duration-300">
      
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-black/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
              <Zap className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">EARNING1</h1>
              <p className="text-sm font-bold text-primary-200 tracking-widest uppercase">Cloud Earning Platform</p>
            </div>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black mt-20 leading-tight">
            Start earning crypto <br />
            <span className="text-primary-200">from your phone.</span>
          </h2>
          <p className="mt-6 text-lg text-primary-100 max-w-md font-medium">
            Join thousands of users generating passive income daily with our cloud earning infrastructure.
          </p>
        </div>

        <div className="relative z-10 space-y-6 mt-12">
          <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 max-w-sm">
            <div className="bg-primary-500 p-3 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Secure & Reliable</h3>
              <p className="text-primary-100 text-sm">Enterprise-grade security</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 max-w-sm ml-8">
            <div className="bg-primary-500 p-3 rounded-xl">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">High Returns</h3>
              <p className="text-primary-100 text-sm">Industry leading ROI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-[#1e1e1e] p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 relative z-10">
          
          <div className="md:hidden flex flex-col items-center justify-center mb-8">
            <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 mb-3 transform -rotate-3">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">EARNING <span className="text-primary-500">1</span></h1>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">Powering the future of earning</p>
          </div>

          <div className="text-left">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Create Account
            </h2>
            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Get started with your free account today.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center">
              <div className="bg-red-100 dark:bg-red-500/20 p-1 rounded-full mr-3 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {error}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('name')}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white sm:text-sm transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                {errors.name && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email')}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white sm:text-sm transition-all"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('mobile')}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white sm:text-sm transition-all"
                    placeholder="Enter 10 digit number"
                    maxLength={10}
                  />
                </div>
                {errors.mobile && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.mobile.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    {...register('password')}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white sm:text-sm transition-all"
                    placeholder="Create a password"
                  />
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                  <span>Referral Code <span className="text-gray-400 font-normal">(Optional)</span></span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Gift className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('referralCode')}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white sm:text-sm transition-all uppercase placeholder:normal-case"
                    placeholder="Enter invite code"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-primary-500/30 text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-95 disabled:opacity-70 disabled:scale-100 group"
              >
                {isSubmitting ? 'Creating Account...' : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Register Now
                  </>
                )}
              </button>
            </div>
            
            <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
                Sign in here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
