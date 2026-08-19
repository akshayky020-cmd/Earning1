import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addTransaction, syncUserBalance } from '../store/slices/dataSlice';
import { updateUser } from '../store/slices/authSlice';
import { Wallet, ShieldCheck, Building, Info, CheckCircle2, ChevronLeft, ChevronRight, Star, Lock, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Withdraw = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [password, setPassword] = useState('');
  
  const savedDetails = user?.paymentDetails || {
    accountNo: '',
    upiId: '',
    ifsc: ''
  };

  const availableBalance = user?.walletBalance || 0;
  const taxRate = 0.10; // 10%
  
  const parsedAmount = Number(withdrawAmount);
  const taxAmount = (parsedAmount * taxRate) || 0;
  const receiveAmount = (parsedAmount - taxAmount) || 0;

  const handleQuickAmount = (percentage: number) => {
    const amount = Math.floor(availableBalance * percentage);
    setWithdrawAmount(amount > 0 ? amount.toString() : '');
  };

  
  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!savedDetails.accountNo && !savedDetails.upiId) {
      alert('Please save your Payment Details first in the Profile section.');
      return;
    }
    
    if (!password) {
      alert('Please enter your withdrawal password.');
      return;
    }

    if (parsedAmount >= 180) {
      if (parsedAmount > availableBalance) {
        alert('Insufficient balance.');
        return;
      }

      dispatch(addTransaction({
        id: `T-${Date.now().toString().slice(-4)}`,
        user: user?.name || 'User',
        type: 'withdraw',
        amount: parsedAmount,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        userId: user?._id || "unknown", status: 'pending' }));
      
      const newBalance = availableBalance - parsedAmount;
      dispatch(updateUser({ walletBalance: newBalance }));
      if (user?._id) dispatch(syncUserBalance({ id: user._id, balance: newBalance }));

      alert(`Withdrawal of ₹${withdrawAmount} submitted and is pending approval! Net amount to receive is ₹${receiveAmount.toFixed(2)}.`);
      setWithdrawAmount('');
      setPassword('');
    } else {
      alert('Minimum withdrawal is ₹180.');
    }
  };


  return (
    <div className="max-w-4xl mx-auto pb-24 bg-gray-50 dark:bg-[#121212] min-h-screen">
      {/* Header */}
      <header className="flex items-center p-4 sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2.5 border border-gray-200 dark:border-white/10 rounded-[14px] text-gray-700 dark:text-gray-300 shadow-sm bg-white dark:bg-[#1e1e1e]">
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-gray-900 dark:text-white mr-10">Withdrawal</h1>
      </header>

      {/* Main Content */}
      <div className="px-3 pb-8 mt-1">
        {/* Orange Balance Card */}
        <div className="bg-orange-500 rounded-[32px] p-6 text-white relative overflow-hidden pb-14 shadow-lg shadow-orange-500/20">
          {/* Background decors */}
          <div className="absolute top-6 right-12 text-white/40"><Star size={16} fill="currentColor" /></div>
          <div className="absolute bottom-10 left-1/2 text-white/40"><Star size={12} fill="currentColor" /></div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="flex items-start mb-4 relative z-10">
            <div className="bg-white/20 p-3 rounded-2xl mr-4 backdrop-blur-sm shadow-inner">
              <Wallet size={28} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-orange-50 text-sm font-medium mb-1">Available Balance</p>
              <h2 className="text-4xl font-extrabold tracking-tight">₹{availableBalance.toFixed(2)}</h2>
            </div>
          </div>
          
          <div className="relative z-10">
            <span className="inline-flex items-center px-3 py-1.5 bg-white/20 rounded-full text-[11px] font-semibold backdrop-blur-sm">
              <ShieldCheck size={14} className="mr-1.5" />
              Withdrawable
            </span>
          </div>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-6">
          {/* Enter Amount Card */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-white/5 -mt-8 relative z-10 mx-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">Withdrawal Amount</h3>
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4 mb-5">
              <div className="flex items-center text-4xl font-extrabold text-orange-500 w-full">
                <span className="mr-2">₹</span>
                <input 
                  type="number" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-transparent outline-none text-orange-500 dark:text-orange-400 placeholder-gray-300 dark:placeholder-gray-600"
                  placeholder="0"
                  min={180}
                  required
                />
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-500 p-2.5 rounded-full shrink-0 ml-2 shadow-sm border border-orange-100 dark:border-orange-500/20">
                <Building size={18} strokeWidth={2.5} />
              </div>
            </div>

            <div className="flex items-center text-[13px] text-gray-500 dark:text-gray-400 mb-6 font-medium">
              <div className="bg-orange-500 text-white rounded-full p-0.5 mr-2 shadow-sm">
                <Info size={12} strokeWidth={3} />
              </div>
              Minimum withdrawal: ₹180
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { label: '25%', val: 0.25 },
                { label: '50%', val: 0.50 },
                { label: '75%', val: 0.75 },
                { label: 'Max', val: 1.0 }
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => handleQuickAmount(btn.val)}
                  className="py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-[13px] font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1e1e1e] hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4 flex items-center mb-6 border border-blue-100 dark:border-blue-900/20">
              <Lock size={18} className="text-orange-500 mr-3 shrink-0" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Withdrawal Password"
                className="bg-transparent outline-none w-full text-gray-900 dark:text-white font-medium text-sm placeholder-gray-400"
                required
              />
            </div>

            <div className="flex justify-between items-center text-[13px] font-medium border-t border-gray-100 dark:border-white/10 pt-5">
              <span className="text-gray-500 dark:text-gray-400">
                Tax (10.00%): <span className="text-gray-900 dark:text-white font-bold">₹{taxAmount.toFixed(2)}</span>
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                You Receive: <span className="text-orange-500 font-bold">₹{receiveAmount.toFixed(2)}</span>
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="mx-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center text-lg">
              <div className="bg-orange-500 text-white rounded-full p-0.5 mr-2 shadow-sm">
                <ChevronRight size={14} strokeWidth={3} />
              </div>
              Instructions
            </h3>
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] p-5 border border-gray-100 dark:border-white/5 space-y-4 shadow-sm">
              <div className="flex items-start">
                <div className="mr-3 shrink-0 mt-0.5 text-orange-500">
                  <CheckCircle2 size={18} fill="currentColor" stroke="white" className="dark:stroke-[#1e1e1e]" />
                </div>
                <p className="text-[13px] font-medium text-gray-600 dark:text-gray-400 leading-snug pt-0.5">Minimum withdrawal amount is <span className="font-bold text-gray-900 dark:text-gray-200">₹180</span>.</p>
              </div>
              <div className="flex items-start border-t border-dashed border-gray-200 dark:border-white/10 pt-4">
                <div className="mr-3 shrink-0 mt-0.5 text-orange-500">
                  <CheckCircle2 size={18} fill="currentColor" stroke="white" className="dark:stroke-[#1e1e1e]" />
                </div>
                <p className="text-[13px] font-medium text-gray-600 dark:text-gray-400 leading-snug pt-0.5">A <span className="font-bold text-gray-900 dark:text-gray-200">10.00%</span> service tax is deducted from every transaction.</p>
              </div>
              <div className="flex items-start border-t border-dashed border-gray-200 dark:border-white/10 pt-4">
                <div className="mr-3 shrink-0 mt-0.5 text-orange-500">
                  <CheckCircle2 size={18} fill="currentColor" stroke="white" className="dark:stroke-[#1e1e1e]" />
                </div>
                <p className="text-[13px] font-medium text-gray-600 dark:text-gray-400 leading-snug pt-0.5">Withdrawals are processed 24/7 with no daily limits.</p>
              </div>
              <div className="flex items-start border-t border-dashed border-gray-200 dark:border-white/10 pt-4">
                <div className="mr-3 shrink-0 mt-0.5 text-orange-500">
                  <Clock size={18} fill="currentColor" stroke="white" className="dark:stroke-[#1e1e1e]" />
                </div>
                <p className="text-[13px] font-medium text-gray-600 dark:text-gray-400 leading-snug pt-0.5">Funds usually arrive within 30 minutes (Max 24h).</p>
              </div>
              <div className="flex items-start border-t border-dashed border-gray-200 dark:border-white/10 pt-4">
                <div className="mr-3 shrink-0 mt-0.5 text-orange-500">
                  <ShieldCheck size={18} fill="currentColor" stroke="white" className="dark:stroke-[#1e1e1e]" />
                </div>
                <p className="text-[13px] font-medium text-gray-600 dark:text-gray-400 leading-snug pt-0.5">Ensure bank details are correct to avoid failed payments.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 mx-1">
            <button 
              type="submit"
              className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/30 flex justify-center items-center active:scale-95 transition-transform text-[17px]"
            >
              Withdraw Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
