import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Search, CheckCircle, XCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateTransactionStatus } from '../../store/slices/dataSlice';

export const AdminFinances = () => {
  const transactions = useSelector((state: RootState) => state.data.transactions);
  const dispatch = useDispatch();

  const handleStatusChange = (id: string, newStatus: string) => {
    dispatch(updateTransactionStatus({ id, status: newStatus }));
  };

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Financial Records</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage deposits, withdrawals, and wallet history.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="Search transactions..."
          />
        </div>
      </header>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-white/5">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">User</th>
                <th className="p-4">Type</th>
                <th className="p-4">Amount (₹)</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                    {tx.id}
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">
                    {tx.user}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      {tx.type === 'deposit' 
                        ? <ArrowDownRight size={16} className="text-green-500" /> 
                        : <ArrowUpRight size={16} className="text-red-500" />
                      }
                      <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{tx.type}</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">
                    {tx.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-gray-500 dark:text-gray-400 text-xs">
                    {tx.date}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide inline-flex ${
                      tx.status === 'completed' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                      tx.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {tx.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleStatusChange(tx.id, 'completed')}
                          className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors rounded-lg inline-flex"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(tx.id, 'rejected')}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors rounded-lg inline-flex"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
