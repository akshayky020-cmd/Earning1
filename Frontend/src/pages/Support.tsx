import React from 'react';
import { ArrowLeft, HeadphonesIcon, MessageCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Support = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-[#121212]  text-slate-900 dark:text-slate-200">
      <header className="flex items-center p-4 md:hidden sticky top-0 z-10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 dark:bg-[#1e1e1e] rounded-full text-primary-600 shadow-sm mr-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Customer Support</h1>
      </header>

      <div className="p-6 space-y-6">
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-500">
            <HeadphonesIcon size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">How can we help?</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Our support team is available 24/7 to assist you.</p>
        </div>

        <div className="grid gap-4">
          <a href="https://t.me/Earning7s" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:border-primary-500 transition-colors group">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 mr-4 group-hover:bg-green-500 group-hover:text-white transition-colors">
              <MessageCircle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white">Telegram Support</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">@Earning7s</p>
            </div>
          </a>
        </div>

        <div className="bg-primary-50 dark:bg-primary-900/10 rounded-2xl p-4 flex items-start border border-primary-100 dark:border-primary-500/20 mt-8">
          <Clock className="text-primary-500 mt-1 mr-3 shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-primary-700 dark:text-primary-400">Working Hours</h4>
            <p className="text-sm text-primary-600 dark:text-primary-300 mt-1">Monday - Sunday: 9:00 AM - 10:00 PM (IST)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
