import React from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, RefreshCw, Cpu, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const FinancialRecords = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const transactions = useSelector((state: RootState) => state.data.transactions);
  
  // Filter for financial records belonging to current user (excluding withdrawals which have their own page)
  const financialRecords = transactions.filter(t => t.type !== 'withdraw' && (t.user === user?.name || t.user === user?._id));

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-[#121212] min-h-screen text-slate-900 dark:text-slate-200">
      <header className="flex items-center p-4 md:hidden sticky top-0 z-10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 dark:bg-[#1e1e1e] rounded-full text-primary-600 shadow-sm mr-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Financial Records</h1>
      </header>
      
      <div className="p-4 space-y-4">
        {financialRecords.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No financial records found.
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
            {financialRecords.map((record, index) => {
              const isIncome = record.type === 'deposit' || record.type === 'daily_reward' || record.type === 'reward';
              
              let Icon = ArrowDownRight;
              let bgClass = 'bg-green-50 dark:bg-green-500/10 text-green-500';
              let name = 'Deposit';
              
              if (record.type === 'purchase') {
                Icon = Cpu;
                bgClass = 'bg-primary-50 dark:bg-primary-500/10 text-primary-500';
                name = 'Machine Purchase';
              } else if (record.type === 'daily_reward' || record.type === 'reward') {
                Icon = Gift;
                bgClass = 'bg-orange-50 dark:bg-orange-500/10 text-orange-500';
                name = 'Daily Check-in Reward';
              }
              
              return (
                <div key={record.id} className={`p-4 ${index !== financialRecords.length - 1 ? 'border-b border-gray-50 dark:border-white/5' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgClass}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white capitalize">{name}</h4>
                        <p className="text-xs text-gray-500">{record.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-black ${isIncome ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
                        {isIncome ? '+' : '-'}₹{record.amount.toFixed(2)}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{record.status}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
