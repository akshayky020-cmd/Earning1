import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../lib/api';
import { RootState } from '../store';
import { PlayCircle, Coins, Wallet, History, Gift, ArrowRightLeft } from 'lucide-react';

interface Ad {
  id: number;
  network: string;
  title: string;
  rewardCoins: number;
}

interface WalletData {
  walletBalance: number;
  coins: number;
  todayEarnings: number;
  totalAdsWatched: number;
}

interface AdHistory {
  id: number;
  adName: string;
  coinsEarned: number;
  date: string;
}

export const WatchAndEarn = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [history, setHistory] = useState<AdHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWatching, setIsWatching] = useState(false);
  const [converting, setConverting] = useState(false);
  const [toast, setToast] = useState('');

  const dailyLimit = 10; // Max ads per day

  const fetchData = async () => {
    if (!user) return;
    try {
      const [walletRes, adsRes, historyRes] = await Promise.all([
        api.get(`/api/user/wallet/${user._id}`),
        api.get('/api/user/ads'),
        api.get(`/api/user/ad_history/${user._id}`)
      ]);
      setWallet(walletRes.data);
      setAds(adsRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleWatchAd = async (ad: Ad) => {
    if (!wallet) return;
    if (wallet.totalAdsWatched >= dailyLimit) {
      showToast('Daily limit reached!');
      return;
    }
    
    setIsWatching(true);
    // Simulate Ad SDK integration
    setTimeout(async () => {
      try {
        const res = await api.post('/api/user/ads/watch', {
          userId: user?._id,
          adId: ad.id
        });
        if (res.data.success) {
          showToast(`Congratulations! You earned ${ad.rewardCoins} Coins.`);
          fetchData();
        }
      } catch (err) {
        showToast('Error verifying ad reward.');
      }
      setIsWatching(false);
    }, 2000);
  };

  const handleConvert = async (coinsToConvert: number) => {
    if (!wallet || wallet.coins < coinsToConvert) {
      showToast('Not enough coins!');
      return;
    }
    
    setConverting(true);
    try {
      const res = await api.post('/api/user/wallet/convert', {
        userId: user?._id,
        coinsToConvert
      });
      if (res.data.success) {
        showToast(`Converted ${coinsToConvert} coins to ₹${coinsToConvert / 100}!`);
        fetchData();
      }
    } catch (err) {
      showToast('Failed to convert coins.');
    }
    setConverting(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  const progressPercent = wallet ? Math.min(100, (wallet.coins / 100) * 100) : 0;

  return (
    <div className="space-y-6 pb-20 relative">
      {toast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-xl shadow-xl font-bold animate-in fade-in slide-in-from-top-5">
          {toast}
        </div>
      )}

      {isWatching && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-primary-500 border-white/20 rounded-full animate-spin mb-4"></div>
          <p className="text-white font-bold text-lg animate-pulse">Watching Ad...</p>
          <p className="text-white/60 text-sm mt-2">Please do not close the app.</p>
        </div>
      )}

      <header>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Watch & Earn</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Watch ads to earn coins and convert to wallet balance.</p>
      </header>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-[32px] p-6 text-white shadow-lg shadow-primary-500/30">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-white/80 font-medium text-sm mb-1">Total Coins</p>
            <h2 className="text-4xl font-black flex items-center">
              <Coins className="w-8 h-8 mr-2 text-yellow-300" />
              {wallet?.coins || 0}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-white/80 font-medium text-sm mb-1">Wallet Balance</p>
            <h3 className="text-2xl font-bold flex items-center justify-end">
              <Wallet className="w-5 h-5 mr-1" />
              ₹{(wallet?.walletBalance || 0).toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
          <div>
            <p className="text-white/80 text-xs">Today's Earnings</p>
            <p className="font-bold">{wallet?.todayEarnings || 0} Coins</p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-xs">Ads Watched Today</p>
            <p className="font-bold">{wallet?.totalAdsWatched || 0} / {dailyLimit}</p>
          </div>
        </div>
      </div>

      {/* Reward Rules */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-white/5">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Gift className="w-5 h-5 mr-2 text-primary-500" />
          Reward Rules
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="text-gray-600 dark:text-gray-400">Conversion Rate:</span>
            <span className="text-gray-900 dark:text-white font-bold bg-primary-50 dark:bg-primary-500/10 text-primary-600 px-3 py-1 rounded-full">100 Coins = ₹1</span>
          </div>

          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-500 font-semibold">Progress to ₹1</span>
              <span className="text-primary-500 font-bold">{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-primary-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Convert Buttons */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <button 
              onClick={() => handleConvert(100)}
              disabled={converting || (wallet?.coins || 0) < 100}
              className="py-2 px-1 bg-gray-100 dark:bg-white/5 hover:bg-primary-50 dark:hover:bg-primary-500/20 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors flex flex-col items-center justify-center"
            >
              <span>100 Coins</span>
              <ArrowRightLeft className="w-3 h-3 my-1 text-primary-500" />
              <span>₹1</span>
            </button>
            <button 
              onClick={() => handleConvert(200)}
              disabled={converting || (wallet?.coins || 0) < 200}
              className="py-2 px-1 bg-gray-100 dark:bg-white/5 hover:bg-primary-50 dark:hover:bg-primary-500/20 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors flex flex-col items-center justify-center"
            >
              <span>200 Coins</span>
              <ArrowRightLeft className="w-3 h-3 my-1 text-primary-500" />
              <span>₹2</span>
            </button>
            <button 
              onClick={() => handleConvert(350)}
              disabled={converting || (wallet?.coins || 0) < 350}
              className="py-2 px-1 bg-gray-100 dark:bg-white/5 hover:bg-primary-50 dark:hover:bg-primary-500/20 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors flex flex-col items-center justify-center"
            >
              <span>350 Coins</span>
              <ArrowRightLeft className="w-3 h-3 my-1 text-primary-500" />
              <span>₹3.50</span>
            </button>
          </div>
        </div>
      </div>

      {/* Watch Ads Section */}
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Available Ads</h3>
        {ads.length === 0 ? (
          <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-8 text-center border border-gray-100 dark:border-white/5">
            <PlayCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No ads available right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ads.map((ad) => (
              <div key={ad.id} className="bg-white dark:bg-[#1e1e1e] rounded-[24px] p-4 flex items-center justify-between shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-inner">
                    <PlayCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{ad.title}</h4>
                    <p className="text-sm text-gray-500 font-medium flex items-center">
                      Reward: <Coins className="w-3 h-3 ml-1 mr-0.5 text-yellow-500" /> <span className="text-yellow-600 dark:text-yellow-400 font-bold ml-1">+{ad.rewardCoins}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleWatchAd(ad)}
                  disabled={isWatching || (wallet?.totalAdsWatched || 0) >= dailyLimit}
                  className="bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                >
                  Watch
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reward History */}
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg flex items-center">
          <History className="w-5 h-5 mr-2 text-gray-400" />
          History
        </h3>
        <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-white/5">
          {history.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">No history yet.</p>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div key={record.id} className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{record.adName}</p>
                    <p className="text-xs text-gray-500">{new Date(record.date).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-500 flex items-center justify-end">
                      +{record.coinsEarned} <Coins className="w-3 h-3 ml-1" />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
