import React from "react";
import { ArrowLeft, Cpu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";

export const ProductHistory = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const purchasedPlans = user?.purchasedPlans || [];

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-[#121212] min-h-screen text-slate-900 dark:text-slate-200">
      <header className="flex items-center p-4 md:hidden sticky top-0 z-10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-100 dark:bg-[#1e1e1e] rounded-full text-primary-600 shadow-sm mr-4"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Product History</h1>
      </header>
      <div className="p-4 space-y-4">
        {purchasedPlans.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No purchased machines yet.
          </div>
        ) : (
          <div className="space-y-4">
            {purchasedPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-4 ${plan.status === 'expired' ? 'opacity-75' : ''}`}
              >
                <div className="flex items-start justify-between mb-3 border-b border-gray-50 dark:border-white/5 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.status === 'active' ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-500' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>
                      <Cpu size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {plan.planName}
                      </h4>
                      <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${plan.status === 'active' ? 'text-green-500' : 'text-gray-500'}`}>
                        {plan.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-lg">₹{plan.price}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <div className="text-gray-500">Daily Income</div>
                  <div className={`text-right font-semibold ${plan.status === 'active' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    ₹{plan.dailyIncome.toFixed(2)}
                  </div>
                  <div className="text-gray-500">Validity</div>
                  <div className="text-right font-medium">{plan.duration} Days</div>
                  <div className="text-gray-500">Purchase Date</div>
                  <div className="text-right font-medium">{plan.purchaseDate}</div>
                  <div className="text-gray-500">Activation Date</div>
                  <div className="text-right font-medium">{plan.activationDate || plan.purchaseDate}</div>
                  <div className="text-gray-500">Expiry Date</div>
                  <div className="text-right font-medium">{plan.expiryDate}</div>
                </div>              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
