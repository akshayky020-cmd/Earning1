import React from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const WithdrawRecords = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const transactions = useSelector((state: RootState) => state.data.transactions);
  
  // Filter for withdrawals belonging to current user
  const withdrawRecords = transactions.filter(t => t.type === 'withdraw' && (t.user === user?.name || t.user === user?._id));

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-[#121212] min-h-screen text-slate-900 dark:text-slate-200">
      <header className="flex items-center p-4 md:hidden sticky top-0 z-10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 dark:bg-[#1e1e1e] rounded-full text-primary-600 shadow-sm mr-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Withdraw Records</h1>
      </header>
      
      <div className="p-4 space-y-4">
        {withdrawRecords.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No withdrawal records found.
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
            {withdrawRecords.map((record, index) => (
              <div key={record.id} className={`p-4 ${index !== withdrawRecords.length - 1 ? 'border-b border-gray-50 dark:border-white/5' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${record.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-500' : record.status === 'completed' ? 'bg-green-50 dark:bg-green-500/10 text-green-500' : 'bg-red-50 dark:bg-red-500/10 text-red-500'}`}>
                      <ArrowUpRight size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Withdrawal</h4>
                      <p className={`text-xs font-medium capitalize ${record.status === 'pending' ? 'text-yellow-500' : record.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>
                        {record.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-lg">₹{record.amount.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#121212] p-2.5 rounded-lg mt-3">
                  <span>{record.date}</span>
                  <span className="font-mono">{record.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
