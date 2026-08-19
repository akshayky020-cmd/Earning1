import React from 'react';
import { ArrowLeft, Users, UserPlus, Gift, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Team = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-[#121212] text-slate-900 dark:text-slate-200">
      <header className="flex items-center p-4 md:hidden sticky top-0 z-10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 md:hidden">
        <h1 className="text-xl font-black text-gray-900 dark:text-white">My Team</h1>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
            <div className="text-primary-500 mb-2">
              <Users size={24} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Total Members</p>
            <h3 className="text-2xl font-black mt-1 text-gray-900 dark:text-white">0</h3>
          </div>
          <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
            <div className="text-emerald-500 mb-2">
              <TrendingUp size={24} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Team Bonus</p>
            <h3 className="text-2xl font-black mt-1 text-gray-900 dark:text-white">₹0</h3>
          </div>
        </div>

        <div className="bg-primary-50 dark:bg-primary-500/10 rounded-2xl p-6 text-center border border-primary-100 dark:border-primary-500/20">
          <div className="w-16 h-16 bg-white dark:bg-black/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-500 shadow-sm">
            <Gift size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Grow Your Team</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Invite friends to join and earn daily commission from their mining activities.</p>
          <button onClick={() => navigate('/invite')} className="w-full py-3 bg-primary-500 text-white rounded-xl font-bold shadow-md hover:bg-primary-600 transition-colors">
            Invite Friends Now
          </button>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 pl-1">Level Statistics</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((level) => (
              <div key={level} className="bg-white dark:bg-[#1e1e1e] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#121212] flex items-center justify-center font-black text-gray-400 mr-4">
                    L{level}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Level {level}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Commission: {level === 1 ? '10%' : level === 2 ? '5%' : '2%'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">0</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">Members</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
