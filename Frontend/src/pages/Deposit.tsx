import { updateSettings } from '../store/slices/dataSlice';
import React, { useState, useEffect } from "react";
import api from '../lib/api';
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../store/slices/authSlice";
import { RootState } from "../store";
import { addTransaction, syncUserBalance } from "../store/slices/dataSlice";
import {
  Wallet,
  ShieldCheck,
  Edit2,
  Info,
  Zap,
  CheckCircle2, ChevronLeft, Star, Image as ImageIcon, ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Deposit = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/settings');
        if (res.data) {
          dispatch(updateSettings(res.data));
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    fetchSettings();
  }, [dispatch]);

  const settings = useSelector((state: RootState) => state.data.settings);
  const navigate = useNavigate();

  
  const [depositAmount, setDepositAmount] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [screenshot, setScreenshot] = useState<string>("");
  const [step, setStep] = useState<1 | 2>(1);

  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(depositAmount);

    if (parsedAmount >= 285) {
      if (utrNumber && utrNumber.length > 0 && utrNumber.length < 12) {
        alert("If providing a UTR / Reference Number, it must be 12 digits.");
        return;
      }
      if (!screenshot) {
        alert("Please upload a screenshot of your payment.");
        return;
      }
      dispatch(
        addTransaction({
          id: `T-${Date.now().toString().slice(-4)}`,
          user: user?.name || "User",
          type: "deposit",
          amount: parsedAmount,
          date: new Date().toISOString().slice(0, 16).replace("T", " "),
          userId: user?._id || "unknown", status: "pending", utrNumber, screenshot }),
      );
      
      alert(`Deposit of ₹${depositAmount} submitted with UTR ${utrNumber}. It is pending approval!`);
      setUtrNumber("");
      setScreenshot("");
      setStep(1);
      setDepositAmount("");
    } else {
      alert("Minimum deposit amount is ₹285.");
    }
  };


  return (
    <div className="max-w-4xl mx-auto pb-12 bg-gray-50 dark:bg-[#121212] min-h-screen">
      {/* Header */}
      <header className="flex items-center p-4 sticky top-0 z-20">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 border border-gray-200 dark:border-white/10 rounded-[14px] text-gray-700 dark:text-gray-300 shadow-sm bg-white dark:bg-[#1e1e1e]"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-gray-900 dark:text-white mr-10">
          Recharge
        </h1>
      </header>

      {/* Main Content */}
      <div className="px-3 pb-8 mt-1">
        {/* Primary Balance Card */}
        <div className="bg-primary-500 rounded-[32px] p-6 text-white relative overflow-hidden pb-14 shadow-lg shadow-primary-500/20">
          {/* Background decors */}
          <div className="absolute top-6 right-12 text-white/40">
            <Star size={16} fill="currentColor" />
          </div>
          <div className="absolute bottom-10 left-1/2 text-white/40">
            <Star size={12} fill="currentColor" />
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

          <div className="flex items-start mb-4 relative z-10">
            <div className="bg-white/20 p-3 rounded-2xl mr-4 backdrop-blur-sm shadow-inner">
              <Wallet size={28} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-primary-50 text-sm font-medium mb-1">
                Available Balance
              </p>
              <h2 className="text-4xl font-extrabold tracking-tight">
                ₹{(user?.walletBalance || 0).toFixed(2)}
              </h2>
            </div>
          </div>

          <div className="relative z-10">
            <span className="inline-flex items-center px-3 py-1.5 bg-white/20 rounded-full text-[11px] font-semibold backdrop-blur-sm">
              <ShieldCheck size={14} className="mr-1.5" />
              Secured Wallet
            </span>
          </div>
        </div>

        
        {step === 1 ? (
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if (Number(depositAmount) >= 285) {
                setStep(2); 
              } else {
                alert("Minimum deposit amount is ₹285.");
              }
            }} 
            className="space-y-6"
          >
            
          {/* Enter Amount Card */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-white/5 -mt-8 relative z-10 mx-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">
              Enter Amount
            </h3>

            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4 mb-5">
              <div className="flex items-center text-4xl font-extrabold text-primary-500 w-full">
                <span className="mr-2">₹</span>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-transparent outline-none text-primary-500 dark:text-primary-400 placeholder-gray-300 dark:placeholder-gray-600"
                  placeholder="0"
                  min={285}
                  required
                />
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-500 p-2.5 rounded-full shrink-0 ml-2 shadow-sm border border-primary-100 dark:border-primary-500/20">
                <Edit2 size={18} strokeWidth={2.5} />
              </div>
            </div>

            <div className="flex items-center text-[13px] text-gray-500 dark:text-gray-400 mb-6 font-medium">
              <div className="bg-primary-500 text-white rounded-full p-0.5 mr-2 shadow-sm">
                <Info size={12} strokeWidth={3} />
              </div>
              Minimum recharge: ₹285
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[720, 285, 520, 1000, 2000, 4785].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setDepositAmount(amount.toString())}
                  className={`py-3.5 rounded-2xl border text-[15px] font-bold transition-all ${
                    Number(depositAmount) === amount
                      ? "bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1e1e1e] hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  ₹{amount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          
            {/* Instructions */}
            <div className="mx-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center text-lg">
                <div className="bg-primary-500 text-white rounded-full p-0.5 mr-2 shadow-sm">
                  <Info size={14} strokeWidth={3} />
                </div>
                Instructions
              </h3>
              <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] p-5 border border-gray-100 dark:border-white/5 space-y-4 shadow-sm">
                <div className="flex items-start">
                  <div className="mr-3 shrink-0 mt-0.5 text-primary-500">
                    <CheckCircle2 size={20} fill="currentColor" stroke="white" className="dark:stroke-[#1e1e1e]" />
                  </div>
                  <p className="text-[13px] font-medium text-gray-600 dark:text-gray-400 leading-snug pt-0.5">
                    Minimum deposit amount is ₹285.
                  </p>
                </div>
                <div className="flex items-start border-t border-dashed border-gray-200 dark:border-white/10 pt-4">
                  <div className="mr-3 shrink-0 mt-0.5 text-primary-500">
                    <CheckCircle2 size={20} fill="currentColor" stroke="white" className="dark:stroke-[#1e1e1e]" />
                  </div>
                  <p className="text-[13px] font-medium text-gray-600 dark:text-gray-400 leading-snug pt-0.5">
                    Select amount and click Recharge Now to get payment details.
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-4 mx-1">
              <button
                type="submit"
                className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-500/30 flex justify-center items-center active:scale-95 transition-transform text-[17px]"
              >
                Recharge Now
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleDeposit} className="space-y-6">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-white/5 -mt-8 relative z-10 mx-1 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Amount to pay</p>
                <p className="text-2xl font-black text-primary-500">₹{depositAmount}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 px-4 py-2 rounded-xl"
              >
                Change
              </button>
            </div>
            {/* Payment Instructions */}
            
          <div className="mx-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">
              Payment Details
            </h3>
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-white/5 space-y-5">
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 text-center">
                  Scan this QR code or copy UPI ID to pay
                </p>
                {settings?.qrCodeUrl && (
                  <div className="bg-white p-2 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm mb-4 inline-block">
                    <img src={settings.qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 object-contain rounded-lg" />
                  </div>
                )}
                
                
                {settings?.upiId && (
                  <div className="w-full mt-3 mb-2">
                    <a href={`upi://pay?pa=${settings.upiId}&pn=${settings.accountName || 'Merchant'}&am=${depositAmount}`} className="w-full flex justify-center items-center py-2.5 rounded-xl border border-primary-200 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/10 font-bold text-sm hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
                      <ExternalLink size={16} className="mr-2" />
                      Pay using UPI App
                    </a>
                  </div>
                )}
                <div className="w-full bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col justify-between mt-2">
                  <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Company UPI ID</p>
                    <p className="font-bold text-gray-900 dark:text-white">{settings?.upiId || 'Not set'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(settings?.upiId || '');
                      alert('UPI ID copied to clipboard!');
                    }}
                    className="text-primary-600 font-bold text-sm bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg"
                  >
                    Copy
                  </button>
                  </div>
                  {settings?.accountName && (
                     <div className="w-full text-left mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 font-medium mb-1">Account Holder Name</p>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{settings.accountName}</p>
                     </div>
                  )}
                  {settings?.paymentInstructions && (
                     <div className="w-full text-left mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 font-medium mb-1">Payment Instructions</p>
                        <p className="text-gray-900 dark:text-gray-300 text-sm whitespace-pre-wrap">{settings.paymentInstructions}</p>
                     </div>
                  )}
                </div>
              </div>
              <div className="pt-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  UTR / Reference Number (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CheckCircle2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white sm:text-sm font-bold tracking-widest"
                    placeholder="e.g. 123456789012"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Payment Screenshot
                </label>
                <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-black/40 transition-colors cursor-pointer text-center">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" required />
                  {screenshot ? (
                    <img src={screenshot} alt="Screenshot preview" className="h-32 object-contain rounded-md" />
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click or drag to upload screenshot</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Instructions */}
          <div className="mx-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center text-lg">
              <div className="bg-primary-500 text-white rounded-full p-0.5 mr-2 shadow-sm">
                <Info size={14} strokeWidth={3} />
              </div>
              Instructions
            </h3>
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] p-5 border border-gray-100 dark:border-white/5 space-y-4 shadow-sm">
              <div className="flex items-start">
                <div className="mr-3 shrink-0 mt-0.5 text-primary-500">
                  <CheckCircle2
                    size={20}
                    fill="currentColor"
                    stroke="white"
                    className="dark:stroke-[#1e1e1e]"
                  />
                </div>
                <p className="text-[13px] font-medium text-gray-600 dark:text-gray-400 leading-snug pt-0.5">
                  Minimum deposit amount is ₹285.
                </p>
              </div>
              <div className="flex items-start border-t border-dashed border-gray-200 dark:border-white/10 pt-4">
                <div className="mr-3 shrink-0 mt-0.5 text-primary-500">
                  <CheckCircle2
                    size={20}
                    fill="currentColor"
                    stroke="white"
                    className="dark:stroke-[#1e1e1e]"
                  />
                </div>
                <p className="text-[13px] font-medium text-gray-600 dark:text-gray-400 leading-snug pt-0.5">
                  Pay and submit within the given time window.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 mx-1">
            <button
              type="submit"
              className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-500/30 flex justify-center items-center active:scale-95 transition-transform text-[17px]"
            >
              Submit Payment Request
            </button>
          </div>
                </form>
        )}
      </div>
    </div>
  );
};
