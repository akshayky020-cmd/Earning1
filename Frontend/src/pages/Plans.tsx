import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { setPlans } from '../store/slices/dataSlice';
import { fetchPlansCatalog, readCachedPlans } from '../lib/planCatalog';
import { Cpu, Zap, Activity } from 'lucide-react';

export const Plans = () => {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const plans = useSelector((state: RootState) => state.data.plans);
  const user  = useSelector((state: RootState) => state.auth.user);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  useEffect(() => {
    // 1. Instantly show cached plans (no blank flash on refresh)
    const cached = readCachedPlans();
    if (cached.length > 0) {
      dispatch(setPlans(cached));
      setLoading(false);
    }

    // 2. Always refresh from API in background
    fetchPlansCatalog()
      .then(plans => dispatch(setPlans(plans)))
      .catch(err  => {
        console.error('Failed to fetch plans:', err);
        if (cached.length === 0) setError('Failed to load plans. Please refresh the page.');
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  const handleBuy = (planId: string) => {
    if (!user) { navigate('/login'); return; }
    setPurchasing(planId);
    navigate(`/payment?planId=${planId}`);
    setPurchasing(null);
  };

  if (loading && plans.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-500">Loading mining plans…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <header className="mb-6 flex flex-col pt-4">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          MINING <span className="text-primary-500">MACHINES</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Rent top-tier cloud miners to generate passive income daily.
        </p>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 && !loading && (
          <div className="col-span-full text-center py-12">
            <Cpu size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Plans Available</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">New mining plans will be added soon.</p>
          </div>
        )}

        {plans.map((plan, index) => {
          const isFeatured = index === 1;
          return (
            <div
              key={plan._id}
              className={`rounded-3xl flex flex-col transform transition duration-300 relative ${
                isFeatured
                  ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/30'
                  : 'bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-white/5 shadow-sm text-gray-900 dark:text-white'
              }`}
            >
              {isFeatured && (
                <div className="absolute top-0 right-4 transform -translate-y-1/2">
                  <span className="bg-white text-primary-600 text-xs font-black uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
                    POPULAR
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${isFeatured ? 'bg-white/20' : 'bg-primary-50 dark:bg-primary-500/10 text-primary-500'}`}>
                    <Cpu size={28} />
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold uppercase tracking-widest ${isFeatured ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      Price
                    </p>
                    <p className="text-2xl font-black">₹{plan.price.toLocaleString()}</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">{plan.planName}</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`flex items-center ${isFeatured ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      <Zap size={14} className="mr-1.5" /> Daily Income
                    </span>
                    <span className="font-bold">₹{plan.dailyIncome}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`flex items-center ${isFeatured ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      <Activity size={14} className="mr-1.5" /> Hash Rate
                    </span>
                    <span className="font-bold">{plan.hashRate || '100 TH/s'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`flex items-center ${isFeatured ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      <Cpu size={14} className="mr-1.5" /> Validity
                    </span>
                    <span className="font-bold">{plan.duration} Days</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl mb-6 ${isFeatured ? 'bg-white/10' : 'bg-gray-50 dark:bg-[#121212]'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isFeatured ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      Total Return
                    </span>
                    <span className="text-xl font-black">₹{plan.totalIncome.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(plan._id)}
                  disabled={purchasing === plan._id}
                  className={`w-full py-3.5 text-sm font-bold rounded-xl transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100 ${
                    isFeatured
                      ? 'bg-white text-primary-600 hover:bg-gray-50'
                      : 'bg-primary-500 text-white hover:bg-primary-600 shadow-md shadow-primary-500/20'
                  }`}
                >
                  {purchasing === plan._id ? 'Opening…' : 'Buy Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
