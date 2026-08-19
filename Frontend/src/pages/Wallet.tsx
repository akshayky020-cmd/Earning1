import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateUser } from '../store/slices/authSlice';
import { CreditCard, Building, User, Hash, Edit3, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Wallet = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);
  
  // Temporary state for the edit form
  const defaultDetails = {
    accountName: user?.paymentDetails?.accountName || user?.name || '',
    accountNo: user?.paymentDetails?.accountNo || '',
    ifsc: user?.paymentDetails?.ifsc || '',
    upiId: user?.paymentDetails?.upiId || ''
  };
  
  const [editDetails, setEditDetails] = useState(defaultDetails);

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateUser({ paymentDetails: editDetails }));
    setIsUpdatingDetails(false);
    alert('Payment details saved securely!');
  };

  const savedDetails = user?.paymentDetails || {
    accountName: '',
    accountNo: '',
    ifsc: '',
    upiId: ''
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <header className="flex items-center p-4 md:hidden sticky top-0 z-10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 dark:bg-[#1e1e1e] rounded-full text-primary-600 shadow-sm mr-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">Payment Details</h1>
      </header>

      <div className="px-4 space-y-6 mt-2">
        {/* Saved Details Section */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-5 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
              <Building size={18} className="mr-2 text-primary-500" />
              Saved Payment Details
            </h3>
            <button 
              onClick={() => {
                if (!isUpdatingDetails) setEditDetails(savedDetails.accountName ? savedDetails : defaultDetails);
                setIsUpdatingDetails(!isUpdatingDetails);
              }}
              className="text-primary-500 hover:text-primary-600 p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              {isUpdatingDetails ? <X size={18} /> : <Edit3 size={18} />}
            </button>
          </div>

          {!isUpdatingDetails ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-primary-50/50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/30">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <User size={16} className="mr-3 text-primary-400" />
                  <span className="text-sm font-medium">Account Name</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{savedDetails.accountName || 'Not Set'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary-50/50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/30">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Hash size={16} className="mr-3 text-primary-400" />
                  <span className="text-sm font-medium">Account No.</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {savedDetails.accountNo ? `**** **** ${savedDetails.accountNo.slice(-4)}` : 'Not Set'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary-50/50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/30">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <CreditCard size={16} className="mr-3 text-primary-400" />
                  <span className="text-sm font-medium">UPI ID</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{savedDetails.upiId || 'Not Set'}</span>
              </div>
            </div>
          ) : (
            <form className="space-y-4 animate-in fade-in slide-in-from-top-4" onSubmit={handleSaveDetails}>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 pl-1">Bank Account Name</label>
                <input 
                  type="text" 
                  value={editDetails.accountName}
                  onChange={(e) => setEditDetails({...editDetails, accountName: e.target.value})}
                  placeholder="Full Name as per Bank" 
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 pl-1">Bank Account Number</label>
                <input 
                  type="text" 
                  value={editDetails.accountNo}
                  onChange={(e) => setEditDetails({...editDetails, accountNo: e.target.value})}
                  placeholder="Account Number" 
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 pl-1">IFSC Code</label>
                <input 
                  type="text" 
                  value={editDetails.ifsc}
                  onChange={(e) => setEditDetails({...editDetails, ifsc: e.target.value})}
                  placeholder="IFSC Code" 
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 pl-1">UPI ID</label>
                <input 
                  type="text" 
                  value={editDetails.upiId}
                  onChange={(e) => setEditDetails({...editDetails, upiId: e.target.value})}
                  placeholder="e.g. name@bank" 
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary-500 text-white font-bold rounded-xl shadow-md hover:bg-primary-600 transition-colors">
                Save Details securely
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
