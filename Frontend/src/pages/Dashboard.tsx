import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { updateUser } from "../store/slices/authSlice";
import api from "../lib/api";
import {
  Wallet,
  Cpu,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  HeadphonesIcon,
} from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";

export const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/users/profile');
        dispatch(updateUser(res.data));
      } catch (err) {
        console.error("Failed to sync profile:", err);
      }
    };
    fetchProfile();
  }, [dispatch]);

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setShowPaymentSuccess(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const purchasedPlans = user?.purchasedPlans || [];

  const quickActions = [
    {
      name: "Recharge",
      icon: ArrowDownRight,
      color: "text-green-500",
      bg: "bg-green-100 dark:bg-green-500/20",
      action: () => navigate("/deposit"),
    },
    {
      name: "Withdraw",
      icon: ArrowUpRight,
      color: "text-red-500",
      bg: "bg-red-100 dark:bg-red-500/20",
      action: () => navigate("/withdraw"),
    },
    {
      name: "Invite",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-500/20",
      action: () => navigate("/invite"),
    },
    {
      name: "Support",
      icon: HeadphonesIcon,
      color: "text-purple-500",
      bg: "bg-purple-100 dark:bg-purple-500/20",
      action: () => navigate("/support"),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {showPaymentSuccess && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/60 dark:bg-green-500/10 dark:text-green-300">
          Payment successful. Your plan has been activated and your machine is now live.
        </div>
      )}
      {/* Header Profile Area */}
      <div className="bg-primary-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <span className="text-xl font-bold">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <p className="text-primary-100 text-sm">Welcome back,</p>
              <h2 className="text-xl font-bold">{user?.name || "Miner"}</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-primary-100 text-xs">
              ID: {user?._id?.substring(0, 8) || "MINER-123"}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-primary-100 text-sm">Total Assets (₹)</p>
          <h1 className="text-4xl font-bold mt-1">
            ₹{user?.walletBalance?.toLocaleString() || "0"}
          </h1>
        </div>

        <div className="flex justify-between mt-6 bg-white/10 p-3 rounded-2xl backdrop-blur-md">
          <div className="text-center w-1/2 border-r border-white/20">
            <p className="text-xs text-primary-100">Today's Earnings</p>
            <p className="font-bold">₹0.00</p>
          </div>
          <div className="text-center w-1/2">
            <p className="text-xs text-primary-100">Total Revenue</p>
            <p className="font-bold">₹0.00</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4 px-2">
        {quickActions.map((action) => (
          <button
            key={action.name}
            onClick={action.action}
            className="flex flex-col items-center space-y-2 group"
          >
            <div
              className={`w-14 h-14 ${action.bg} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
            >
              <action.icon size={24} className={action.color} />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {action.name}
            </span>
          </button>
        ))}
      </div>

      {/* Active Miners */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-sm p-6 border border-gray-100 dark:border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Cpu className="mr-2 text-primary-500" size={20} />
            My Miners
          </h2>
          <button onClick={() => navigate("/plans")} className="text-primary-500 text-sm font-semibold hover:text-primary-600">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {purchasedPlans.slice(0, 3).map((plan) => (
            <div
              key={plan.id}
              className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-500">
                  <Cpu size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {plan.planName}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Daily:{" "}
                    <span className="text-primary-500 font-semibold">
                      ₹{plan.dailyIncome}
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Validity
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {plan.duration} Days
                </p>
                <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg mt-1 uppercase tracking-wider">
                  {plan.status}
                </span>
              </div>
            </div>
          ))}

          {purchasedPlans.length === 0 && (
            <div className="text-center py-8">
              <Cpu
                size={48}
                className="mx-auto text-gray-300 dark:text-gray-700 mb-3"
              />
              <p className="text-gray-500 dark:text-gray-400">
                No active miners found.
              </p>
              <button
                onClick={() => navigate("/plans")}
                className="mt-4 px-6 py-2 bg-primary-500 text-white font-semibold rounded-xl shadow-md shadow-primary-500/20"
              >
                Buy a Machine
              </button>
            </div>
          )}
              </div>

      </div>

    </div>

  );
};
