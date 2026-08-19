import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MonitorPlay, BarChart, X } from 'lucide-react';
import api from '../../lib/api';

interface Ad {
  id: number;
  network: string;
  unitId: string;
  title: string;
  rewardCoins: number;
  status: string;
}

export const AdminAds = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState({ totalAds: 0, activeAds: 0, totalEarnings: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  
  const [formData, setFormData] = useState({
    network: 'Google AdMob',
    unitId: '',
    title: '',
    rewardCoins: 10,
    status: 'active'
  });

  const fetchAds = async () => {
    try {
      const res = await api.get('/api/admin/ads');
      setAds(res.data);
      const statsRes = await api.get('/api/admin/ads/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await api.put(`/api/admin/ads/${editingAd.id}`, formData);
      } else {
        await api.post('/api/admin/ads', formData);
      }
      setIsModalOpen(false);
      fetchAds();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      network: ad.network,
      unitId: ad.unitId,
      title: ad.title,
      rewardCoins: ad.rewardCoins,
      status: ad.status
    });
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditingAd(null);
    setFormData({ network: 'Google AdMob', unitId: '', title: '', rewardCoins: 10, status: 'active' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this ad?")) {
      await api.delete(`/api/admin/ads/${id}`);
      fetchAds();
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Ad Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage ad networks, units, and rewards.</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center transition-colors shadow-lg shadow-red-500/30"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Ad
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Ads</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
              <MonitorPlay className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalAds}</p>
        </div>
        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Active Ads</h3>
            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500">
              <MonitorPlay className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.activeAds}</p>
        </div>
        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Coins Rewarded</h3>
            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
              <BarChart className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalEarnings}</p>
        </div>
      </div>

      {/* Ad List */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-[32px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/10">
                <th className="p-5 text-sm font-semibold text-gray-500 dark:text-gray-400">Ad Name</th>
                <th className="p-5 text-sm font-semibold text-gray-500 dark:text-gray-400">Network</th>
                <th className="p-5 text-sm font-semibold text-gray-500 dark:text-gray-400">Reward (Coins)</th>
                <th className="p-5 text-sm font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="p-5 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-5">
                    <p className="font-bold text-gray-900 dark:text-white">{ad.title}</p>
                    <p className="text-xs text-gray-500">{ad.unitId}</p>
                  </td>
                  <td className="p-5 text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {ad.network}
                  </td>
                  <td className="p-5 text-sm font-bold text-orange-500">
                    +{ad.rewardCoins}
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${ad.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-400'}`}>
                      {ad.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button onClick={() => openEdit(ad)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors mr-2">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(ad.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {ads.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No ads found. Add a new ad to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-md rounded-[32px] p-6 border border-gray-100 dark:border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingAd ? 'Edit Ad' : 'Add New Ad'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Ad Network</label>
                <select 
                  value={formData.network}
                  onChange={e => setFormData({...formData, network: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                >
                  <option value="Google AdMob">Google AdMob</option>
                  <option value="Unity Ads">Unity Ads</option>
                  <option value="AppLovin">AppLovin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Ad Title</label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                  placeholder="e.g. Rewarded Video Ad 1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Ad Unit ID</label>
                <input 
                  type="text"
                  required
                  value={formData.unitId}
                  onChange={e => setFormData({...formData, unitId: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                  placeholder="e.g. ca-app-pub-xxx/yyy"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Reward Coins</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    value={formData.rewardCoins}
                    onChange={e => setFormData({...formData, rewardCoins: Number(e.target.value)})}
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/30 transition-all active:scale-95"
                >
                  {editingAd ? 'Save Changes' : 'Add Ad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
