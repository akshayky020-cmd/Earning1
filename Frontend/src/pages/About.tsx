import React from 'react';
import { ArrowLeft, Building2, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const About = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-[#121212]  text-slate-900 dark:text-slate-200">
      <header className="flex items-center p-4 md:hidden sticky top-0 z-10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 dark:bg-[#1e1e1e] rounded-full text-primary-600 shadow-sm mr-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">About Company</h1>
      </header>

      <div className="p-6 space-y-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-lg shadow-primary-500/30">
            <Zap size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">EARNING1</h2>
          <p className="text-primary-600 dark:text-primary-400 font-bold uppercase tracking-widest text-sm mb-4">Cloud Earning Infrastructure</p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
            We are a leading provider of cloud earning services, offering accessible and profitable cryptocurrency earning solutions for everyone. Our state-of-the-art facilities ensure maximum uptime and optimal hash rates.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex space-x-4">
            <div className="text-blue-500 mt-1">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Global Operations</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Our data centers are strategically located in regions with abundant renewable 1, reducing costs and environmental impact while maximizing returns.
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex space-x-4">
            <div className="text-green-500 mt-1">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Secure Investments</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                We employ enterprise-grade security protocols to protect your funds and personal information. Your peace of mind is our top priority.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-gray-200 dark:border-white/10">
          <p className="text-xs text-gray-400 font-medium">Version 1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">&copy; 2024 Earning 1. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
