import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { updateUser } from "../store/slices/authSlice";
import { addTransaction, syncUserBalance } from "../store/slices/dataSlice";
import {
  ChevronLeft,
  Star,
  Calendar as CalendarIcon,
  CheckCircle2,
  History,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CheckIn = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const checkInState = user?.checkInState || {
    streak: 0,
    totalDays: 0,
    totalEarned: 0,
    lastCheckInDate: null,
    history: [],
  };

  const today = new Date();
  const todayStr = today.toDateString(); // e.g. "Thu Jul 09 2026"

  const lastCheckInDateStr = checkInState.lastCheckInDate
    ? new Date(checkInState.lastCheckInDate).toDateString()
    : null;

  const hasClaimedToday = lastCheckInDateStr === todayStr;

  // Calculate today's reward based on streak pattern (Day 1 to 7 = ₹1 to ₹7)
  // If we claimed today, the streak already includes today.
  // If we haven't claimed today, the next reward is streak % 7 + 1.

  // Actually, wait: "After completing Day 7, the cycle should reset to Day 1".
  // So if current streak is 7, the next claim is Day 1 (₹1).
  // If we haven't claimed today:
  let currentCycleDay = checkInState.streak % 7;
  let nextRewardAmount = currentCycleDay + 1;

  // If we already claimed today, the reward we got today was:
  let claimedAmount =
    checkInState.streak % 7 === 0 ? 7 : checkInState.streak % 7;

  const displayRewardAmount = hasClaimedToday
    ? claimedAmount
    : nextRewardAmount;

  const handleClaim = () => {
    if (hasClaimedToday) return;

    // Is streak continuing?
    // Check if yesterday was the last claim
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = checkInState.streak;
    if (lastCheckInDateStr === yesterday.toDateString()) {
      newStreak += 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }

    const reward = ((newStreak - 1) % 7) + 1;

    const newHistoryEntry = {
      id: Date.now().toString(),
      date: today.toISOString(),
      amount: reward,
    };

    const newCheckInState = {
      streak: newStreak,
      totalDays: checkInState.totalDays + 1,
      totalEarned: checkInState.totalEarned + reward,
      lastCheckInDate: today.toISOString(),
      history: [newHistoryEntry, ...checkInState.history],
    };

    // Update wallet balance
    const newBalance = (user?.walletBalance || 0) + reward;

    dispatch(
      updateUser({
        checkInState: newCheckInState,
        walletBalance: newBalance,
      })
    );
    if (user?._id) dispatch(syncUserBalance({ id: user._id, balance: newBalance }));

    // Optionally add a transaction record
    dispatch(
      addTransaction({
        id: `T-${Date.now().toString().slice(-4)}`,
        user: user?.name || "User",
        userId: user?._id || "unknown", type: "reward",
        amount: reward,
        date: today.toISOString().slice(0, 16).replace("T", " "),
        status: "completed",
      }),
    );
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(today);

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
          Daily Check-in
        </h1>
      </header>

      <div className="px-3 pb-8 mt-1">
        {/* Dashboard Card */}
        <div className="bg-orange-500 rounded-[32px] p-6 text-white relative overflow-hidden pb-10 shadow-lg shadow-orange-500/20 mx-1">
          {/* Background decors */}
          <div className="absolute top-6 right-12 text-white/40">
            <Star size={16} fill="currentColor" />
          </div>
          <div className="absolute bottom-10 left-1/2 text-white/40">
            <Star size={12} fill="currentColor" />
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 mb-6">
            <p className="text-orange-100 text-sm font-medium mb-1">
              Hello, {user?.mobile || user?.name}
            </p>
            <h2 className="text-2xl font-bold">{formattedDate}</h2>
          </div>

          <div className="grid grid-cols-3 gap-2 relative z-10 divide-x divide-white/20 border-t border-white/20 pt-4 mt-2">
            <div className="flex flex-col items-center">
              <div className="bg-white/20 p-2 rounded-full mb-1">
                <Star size={14} className="text-white" />
              </div>
              <span className="text-xl font-bold">{checkInState.streak}</span>
              <span className="text-[10px] font-semibold text-orange-100 tracking-wider">
                DAY STREAK
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/20 p-2 rounded-full mb-1">
                <CalendarIcon size={14} className="text-white" />
              </div>
              <span className="text-xl font-bold">
                {checkInState.totalDays}
              </span>
              <span className="text-[10px] font-semibold text-orange-100 tracking-wider">
                TOTAL DAYS
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/20 p-2 rounded-full mb-1">
                <span className="text-sm font-black px-1">₹</span>
              </div>
              <span className="text-xl font-bold">
                ₹{checkInState.totalEarned}
              </span>
              <span className="text-[10px] font-semibold text-orange-100 tracking-wider">
                EARNED
              </span>
            </div>
          </div>
        </div>

        {/* Claim Card */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-white/5 -mt-6 relative z-10 mx-3 flex flex-col items-center pt-8">
          {hasClaimedToday && (
            <div className="absolute -top-4 bg-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center shadow-md">
              <CheckCircle2 size={14} className="mr-1.5" /> CHECKED IN TODAY
            </div>
          )}

          {/* Coin Graphic */}
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-4 border-4 border-yellow-100 dark:border-yellow-900/30">
            <Star size={40} fill="white" className="text-yellow-100" />
          </div>

          <h2 className="text-5xl font-black text-orange-500 mb-2">
            ₹{displayRewardAmount}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">
            Today's Reward • Claim once per day
          </p>

          <button
            onClick={handleClaim}
            disabled={hasClaimedToday}
            className={`w-full py-4 rounded-2xl font-bold text-[16px] transition-all flex justify-center items-center ${
              hasClaimedToday
                ? "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-95"
            }`}
          >
            {hasClaimedToday ? (
              <>
                <CheckCircle2 size={18} className="mr-2" />
                Already Claimed Today
              </>
            ) : (
              "Claim Daily Reward"
            )}
          </button>
        </div>

        {/* 7-Day Cycle */}
        <div className="mt-8 mx-2">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center text-lg">
            <CalendarIcon size={18} className="mr-2 text-orange-500" />
            7-Day Cycle
          </h3>
          <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] p-4 shadow-sm border border-gray-100 dark:border-white/5 overflow-x-auto hide-scrollbar">
            <div className="flex space-x-2 min-w-max pb-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                // Determine if this day in the cycle is completed, current, or pending
                // checkInState.streak represents the total consecutive days.
                // We map this to a 1-7 cycle.

                const currentCycleCount = hasClaimedToday
                  ? checkInState.streak % 7 || 7
                  : (checkInState.streak % 7) + 1;

                let status = "pending";
                if (hasClaimedToday) {
                  if (day < currentCycleCount) status = "completed";
                  else if (day === currentCycleCount)
                    status = "completed_today";
                } else {
                  if (day < currentCycleCount) status = "completed";
                  else if (day === currentCycleCount) status = "current";
                }

                return (
                  <div
                    key={day}
                    className={`flex flex-col items-center justify-center w-[54px] h-[72px] rounded-xl border transition-colors ${
                      status === "completed" || status === "completed_today"
                        ? "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 text-orange-500"
                        : status === "current"
                          ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20"
                          : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase mb-1 ${
                        status === "current" ? "text-orange-100" : "opacity-70"
                      }`}
                    >
                      Day {day}
                    </span>
                    <span className="text-lg font-black">₹{day}</span>
                    <div className="mt-1">
                      {status === "completed" ||
                      status === "completed_today" ? (
                        <CheckCircle2
                          size={12}
                          fill="currentColor"
                          stroke="white"
                          className="dark:stroke-[#121212]"
                        />
                      ) : (
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${status === "current" ? "bg-white" : "bg-gray-300 dark:bg-gray-600"}`}
                        ></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="mt-8 mx-2 mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center text-lg">
            <History size={18} className="mr-2 text-orange-500" />
            Recent Check-ins
          </h3>

          <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] p-4 shadow-sm border border-gray-100 dark:border-white/5 space-y-3">
            {checkInState.history.length === 0 ? (
              <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm font-medium">
                No recent check-ins found.
              </div>
            ) : (
              checkInState.history.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 mr-3">
                      <CheckCircle2
                        size={20}
                        fill="currentColor"
                        stroke="white"
                        className="dark:stroke-[#1e1e1e]"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                        Daily Check-in
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        •{" "}
                        {new Date(entry.date).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-orange-500">
                    +₹{entry.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
