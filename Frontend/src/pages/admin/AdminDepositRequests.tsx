import { useState } from 'react';
import { Search, CheckCircle, XCircle, Image as ImageIcon, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateTransactionStatus } from '../../store/slices/dataSlice';

export const AdminDepositRequests = () => {
  const allTransactions = useSelector((state: RootState) => state.data.transactions);
  const depositRequests = allTransactions.filter(t => t.type === 'deposit');
  const dispatch = useDispatch();

  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const handleStatusChange = (id: string, newStatus: string) => {
    dispatch(updateTransactionStatus({ id, status: newStatus }));
  };

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Deposit Requests</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review user deposit requests and screenshots.</p>
        </div>
      </header>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-white/5">
                <th className="p-4">Date</th>
                <th className="p-4">User</th>
                <th className="p-4">Amount</th>
                <th className="p-4">UTR Number</th>
                <th className="p-4">Screenshot</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {depositRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 text-sm text-gray-500">{req.date}</td>
                  <td className="p-4 text-sm font-semibold text-gray-900 dark:text-white">{req.user}</td>
                  <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">₹{req.amount}</td>
                  <td className="p-4 text-sm font-mono text-gray-500">{req.utrNumber || '-'}</td>
                  <td className="p-4">
                    {req.screenshot ? (
                      <button 
                        onClick={() => setSelectedScreenshot(req.screenshot || '')}
                        className="flex items-center text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-1 rounded-lg"
                      >
                        <ImageIcon size={14} className="mr-1" /> View
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize
                      ${req.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {req.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleStatusChange(req.id, 'completed')}
                          className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors rounded-lg inline-flex"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(req.id, 'rejected')}
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
              {depositRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No deposit requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-3xl w-full bg-white dark:bg-[#1e1e1e] rounded-[24px] p-2">
            <button 
              onClick={() => setSelectedScreenshot(null)}
              className="absolute -top-4 -right-4 p-2 bg-white dark:bg-[#1e1e1e] rounded-full shadow-lg text-gray-500 hover:text-gray-900 z-10"
            >
              <X size={24} />
            </button>
            <div className="overflow-hidden rounded-[16px] bg-gray-100 dark:bg-black/50 flex items-center justify-center min-h-[300px]">
              <img 
                src={selectedScreenshot} 
                alt="Payment Screenshot" 
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
