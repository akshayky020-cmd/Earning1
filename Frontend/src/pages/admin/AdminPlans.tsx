import React, { useState, useEffect } from 'react';
import { Cpu, Plus, Edit2, Trash2, X, QrCode, Image as ImageIcon } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setPlans, addPlan, updatePlan, deletePlan, Plan } from '../../store/slices/dataSlice';
import { fetchPlansCatalog, readCachedPlans, writeCachedPlans, upsertCachedPlan, removeCachedPlan } from '../../lib/planCatalog';
import api from '../../lib/api';

export const AdminPlans = () => {
  const plans   = useSelector((state: RootState) => state.data.plans);
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingPlan, setEditingPlan]     = useState<Plan | null>(null);

  // Form state
  const [planName,    setPlanName]    = useState('');
  const [price,       setPrice]       = useState('');
  const [dailyIncome, setDailyIncome] = useState('');
  const [duration,    setDuration]    = useState('');
  const [hashRate,    setHashRate]    = useState('');
  const [qrCode,      setQrCode]      = useState('');   // base64 or URL
  const [qrCodeName,  setQrCodeName]  = useState('');

  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // ── Fetch plans (cache-first) ───────────────────────────────────────────────
  useEffect(() => {
    // Show cached instantly
    const cached = readCachedPlans();
    if (cached.length > 0) { dispatch(setPlans(cached)); setLoading(false); }

    fetchPlansCatalog()
      .then(latest => dispatch(setPlans(latest)))
      .catch(err => {
        console.error('Failed to fetch plans:', err);
        if (cached.length === 0) setFetchError('Failed to load plans. Check your connection.');
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  // ── Modal helpers ────────────────────────────────────────────────────────────
  const openModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanName(plan.planName);
      setPrice(String(plan.price));
      setDailyIncome(String(plan.dailyIncome));
      setDuration(String(plan.duration));
      setHashRate(plan.hashRate || '');
      setQrCode(plan.qrCode || '');
      setQrCodeName('');
    } else {
      setEditingPlan(null);
      setPlanName(''); setPrice(''); setDailyIncome('');
      setDuration(''); setHashRate(''); setQrCode(''); setQrCodeName('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingPlan(null); };

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('QR image must be less than 5 MB.'); return; }
    setQrCodeName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setQrCode(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── Submit (Create / Update) ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalIncome = Number(dailyIncome) * Number(duration);
    setSubmitting(true);

    const payload = {
      planName:    planName.trim(),
      price:       Number(price),
      dailyIncome: Number(dailyIncome),
      duration:    Number(duration),
      totalIncome,
      hashRate:    hashRate.trim(),
      qrCode,
    };

    try {
      if (editingPlan) {
        const res = await api.put(`/api/plans/${editingPlan._id}`, payload);
        dispatch(updatePlan(res.data));
        upsertCachedPlan(res.data);
        alert('Plan updated successfully!');
      } else {
        const res = await api.post('/api/plans', payload);
        dispatch(addPlan(res.data));
        // Update cache
        const next = [res.data, ...readCachedPlans()];
        writeCachedPlans(next);
        alert('Plan added successfully!');
      }
      closeModal();
    } catch (error: any) {
      console.error('Failed to save plan:', error);
      alert(error.response?.data?.message || 'Failed to save plan. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this plan? This cannot be undone.')) return;
    try {
      await api.delete(`/api/plans/${id}`);
      dispatch(deletePlan(id));
      removeCachedPlan(id);
      alert('Plan deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete plan:', error);
      alert(error.response?.data?.message || 'Failed to delete plan.');
    }
  };

  if (loading && plans.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-500">Loading plans…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Earning Plans</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Add, edit, or delete investment plans. Each plan has its own QR code.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-colors"
        >
          <Plus size={20} />
          <span>Add New Plan</span>
        </button>
      </header>

      {fetchError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
          {fetchError}
        </div>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <Cpu size={48} className="mx-auto mb-3 opacity-30" />
            <p>No plans yet. Click "Add New Plan" to get started.</p>
          </div>
        )}

        {plans.map(plan => (
          <div key={plan._id} className="bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl">
                  <Cpu size={28} />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openModal(plan)}
                    title="Edit plan"
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    title="Delete plan"
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{plan.planName}</h3>
              <p className="text-3xl font-black text-gray-900 dark:text-white mb-5">₹{plan.price.toLocaleString()}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Daily Income</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{plan.dailyIncome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Duration</span>
                  <span className="font-bold text-gray-900 dark:text-white">{plan.duration} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Hash Rate</span>
                  <span className="font-bold text-gray-900 dark:text-white">{plan.hashRate || '—'}</span>
                </div>
              </div>

              {/* QR code indicator */}
              <div className="mt-4 flex items-center gap-2">
                <QrCode size={14} className={plan.qrCode ? 'text-green-500' : 'text-gray-300'} />
                <span className={`text-xs font-semibold ${plan.qrCode ? 'text-green-500' : 'text-gray-400'}`}>
                  {plan.qrCode ? 'QR code attached' : 'No QR code — users cannot pay'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#121212] p-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Return</span>
              <span className="text-lg font-black text-green-600 dark:text-green-400">₹{plan.totalIncome.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-white/10 my-4">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {editingPlan ? 'Edit Plan' : 'Add New Plan'}
              </h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Plan Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Plan Name</label>
                <input
                  type="text"
                  value={planName}
                  onChange={e => setPlanName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                  placeholder="e.g. Antminer S19 Pro"
                />
              </div>

              {/* Price + Daily Income */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Price (₹)</label>
                  <input
                    type="number" min={1}
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Daily Income (₹)</label>
                  <input
                    type="number" min={0} step="0.01"
                    value={dailyIncome}
                    onChange={e => setDailyIncome(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Duration + Hash Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Duration (Days)</label>
                  <input
                    type="number" min={1}
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Hash Rate</label>
                  <input
                    type="text"
                    value={hashRate}
                    onChange={e => setHashRate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                    placeholder="e.g. 110 TH/s"
                  />
                </div>
              </div>

              {/* Total return preview */}
              {dailyIncome && duration && (
                <div className="rounded-xl bg-green-50 dark:bg-green-500/10 px-4 py-3 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total Return: </span>
                  <strong className="text-green-600 dark:text-green-400">
                    ₹{(Number(dailyIncome) * Number(duration)).toLocaleString()}
                  </strong>
                </div>
              )}

              {/* QR Code upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                  <QrCode size={16} className="text-red-500" />
                  Plan QR Code <span className="font-normal text-gray-400">(for UPI payment)</span>
                </label>
                <label className="relative block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-5 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-500/5 transition-colors">
                  <input type="file" accept="image/*" onChange={handleQrFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {qrCode ? (
                    <div className="space-y-2">
                      <img src={qrCode} alt="QR preview" className="h-36 object-contain mx-auto rounded-lg" />
                      {qrCodeName && <p className="text-xs text-gray-500 truncate">{qrCodeName}</p>}
                      <p className="text-xs text-green-600 font-semibold">✓ QR code ready</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to upload QR code</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5 MB</p>
                    </>
                  )}
                </label>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : editingPlan ? 'Save Changes' : 'Add Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
