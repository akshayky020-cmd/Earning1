import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Cpu, ShieldCheck, AlertCircle, CheckCircle2, Upload, Clock } from 'lucide-react';
import api from '../lib/api';
import { RootState } from '../store';
import { fetchPlanById, readCachedPlans } from '../lib/planCatalog';
import { setPlans } from '../store/slices/dataSlice';
import type { Plan } from '../store/slices/dataSlice';

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 'details' | 'confirm' | 'submitted';

// ─── Component ───────────────────────────────────────────────────────────────

export const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const dispatch       = useDispatch();

  const plans = useSelector((state: RootState) => state.data.plans);
  const planId = searchParams.get('planId') || '';

  // Try Redux store first (instant if coming from Plans page)
  const reduxPlan = useMemo(
    () => plans.find(p => p._id === planId) ?? null,
    [planId, plans]
  );

  const [plan, setPlan]         = useState<Plan | null>(reduxPlan);
  const [loading, setLoading]   = useState(!reduxPlan);
  const [step, setStep]         = useState<Step>('details');
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [utrNumber, setUtrNumber]   = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [screenshotName, setScreenshotName] = useState('');

  // Load plan — from cache → store → API (with per-plan QR code)
  useEffect(() => {
    if (!planId) {
      setError('No plan selected. Please choose a plan to continue.');
      setLoading(false);
      return;
    }
    if (reduxPlan) { setPlan(reduxPlan); setLoading(false); return; }

    // Try localStorage cache first
    const cached = readCachedPlans().find(p => p._id === planId) ?? null;
    if (cached) {
      setPlan(cached);
      dispatch(setPlans([...plans.filter(p => p._id !== planId), cached]));
      setLoading(false);
      return;
    }

    // Fetch single plan by ID (Bug #2 fix — this route now exists)
    fetchPlanById(planId)
      .then(p => {
        if (p) {
          setPlan(p);
          dispatch(setPlans([...plans.filter(x => x._id !== planId), p]));
        } else {
          setError('Selected plan not found. Please return to the plans page and try again.');
        }
      })
      .catch(() => setError('Unable to load plan details. Please try again.'))
      .finally(() => setLoading(false));
  }, [planId, reduxPlan]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Screenshot must be less than 5 MB.'); return; }
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;
    if (!screenshot) { setError('Please upload a screenshot of your payment.'); return; }
    setError('');
    setSubmitting(true);

    try {
      await api.post(`/api/plans/pay/${planId}`, {
        utrNumber: utrNumber.trim(),
        screenshot,
      });
      setStep('submitted');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to submit payment. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-500">Loading payment details…</p>
      </div>
    );
  }

  // ── Plan not found ──────────────────────────────────────────────────────────
  if (!plan) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error || 'No plan available for payment.'}</span>
          </div>
          <button
            onClick={() => navigate('/plans')}
            className="mt-4 text-sm font-semibold underline"
          >
            ← Back to Plans
          </button>
        </div>
      </div>
    );
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (step === 'submitted') {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Payment Submitted!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          Your payment for <strong>{plan.planName}</strong> has been submitted for verification.
        </p>
        <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-4 mb-8">
          <Clock size={18} className="shrink-0" />
          <span className="text-sm font-medium">
            Admin will verify your payment within 24 hours and activate your plan.
          </span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full rounded-xl bg-primary-500 px-4 py-3 text-sm font-bold text-white hover:bg-primary-600 transition"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => navigate('/plans')}
          className="mt-3 w-full rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition"
        >
          Browse More Plans
        </button>
      </div>
    );
  }

  // ── Main payment layout ─────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-[1.3fr_0.9fr]">

        {/* Left: Plan details */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1e1e1e]">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-primary-100 p-3 text-primary-600 dark:bg-primary-500/10">
              <Cpu size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Plan Checkout</p>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">{plan.planName}</h1>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-6">
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4 dark:bg-[#121212]">
              <span className="font-medium">Plan Price</span>
              <strong className="text-lg text-gray-900 dark:text-white">₹{plan.price.toLocaleString()}</strong>
            </div>
            <div className="flex items-center justify-between px-1">
              <span>Daily Income</span>
              <span className="font-semibold text-green-600 dark:text-green-400">₹{plan.dailyIncome}</span>
            </div>
            <div className="flex items-center justify-between px-1">
              <span>Total Return</span>
              <span className="font-semibold">₹{plan.totalIncome.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between px-1">
              <span>Duration</span>
              <span className="font-semibold">{plan.duration} Days</span>
            </div>
            <div className="flex items-center justify-between px-1">
              <span>Hash Rate</span>
              <span className="font-semibold">{plan.hashRate || '100 TH/s'}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="border-t border-gray-100 dark:border-white/5 pt-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Scan to Pay via UPI</p>
            {plan.qrCode ? (
              <div className="flex justify-center">
                <img
                  src={plan.qrCode}
                  alt={`UPI QR code for ${plan.planName}`}
                  className="h-52 w-52 rounded-2xl border border-gray-200 dark:border-white/10 object-contain bg-white p-2"
                />
              </div>
            ) : (
              <div className="h-52 w-52 mx-auto rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-gray-400 text-sm">
                <Cpu size={32} className="mb-2 opacity-30" />
                <span>QR Code not set</span>
                <span className="text-xs mt-1">Contact admin</span>
              </div>
            )}
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
              Pay exactly <strong className="text-gray-700 dark:text-gray-300">₹{plan.price.toLocaleString()}</strong> via any UPI app
            </p>
          </div>
        </div>

        {/* Right: "I Have Paid" form */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1e1e1e]">
          <div className="mb-5 flex items-center gap-3 text-green-600 dark:text-green-400">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-semibold">Confirm Your Payment</span>
          </div>

          <div className="mb-5 rounded-2xl bg-primary-50 p-4 text-xs text-primary-700 dark:bg-primary-500/10 dark:text-primary-300 leading-relaxed">
            1. Scan the QR code and pay <strong>₹{plan.price.toLocaleString()}</strong><br />
            2. Take a screenshot of the successful transaction<br />
            3. Upload the screenshot below and click "I Have Paid"<br />
            4. Admin will verify and activate your plan within 24 hours
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitPayment} className="space-y-4">
            {/* UTR Number (optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                UTR / Transaction ID <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={utrNumber}
                onChange={e => setUtrNumber(e.target.value)}
                placeholder="12-digit UTR number"
                maxLength={30}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Screenshot upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Payment Screenshot <span className="text-red-500">*</span>
              </label>
              <label className="relative block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-5 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-500/5 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {screenshot ? (
                  <div className="space-y-2">
                    <img
                      src={screenshot}
                      alt="Payment screenshot preview"
                      className="h-32 object-contain mx-auto rounded-lg"
                    />
                    <p className="text-xs text-gray-500 truncate">{screenshotName}</p>
                    <p className="text-xs text-primary-500 font-semibold">✓ Screenshot uploaded</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Click to upload screenshot
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5 MB</p>
                  </>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || !screenshot}
              className="w-full rounded-xl bg-green-500 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-green-500/20 transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
            >
              {submitting ? 'Submitting…' : '✓ I Have Paid — Submit for Verification'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/plans')}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 transition hover:bg-gray-50 dark:hover:bg-white/5"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
