import api from './api';
import type { Plan } from '../store/slices/dataSlice';

const PLAN_CACHE_KEY = 'plan_catalog_cache_v2';

const normalizePlan = (plan: any): Plan => ({
  _id:         String(plan?._id || plan?.id || ''),
  planName:    String(plan?.planName || ''),
  price:       Number(plan?.price       || 0),
  dailyIncome: Number(plan?.dailyIncome || 0),
  duration:    Number(plan?.duration    || 0),
  totalIncome: Number(plan?.totalIncome || 0),
  hashRate:    typeof plan?.hashRate === 'string' ? plan.hashRate : '',
  qrCode:      typeof plan?.qrCode   === 'string' ? plan.qrCode  : '',
  image:       typeof plan?.image    === 'string' ? plan.image   : '',
});

const isPlan = (plan: Plan) => Boolean(plan._id && plan.planName);

export const readCachedPlans = (): Plan[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PLAN_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizePlan).filter(isPlan);
  } catch {
    return [];
  }
};

export const writeCachedPlans = (plans: Plan[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PLAN_CACHE_KEY, JSON.stringify(plans.map(normalizePlan).filter(isPlan)));
  } catch {
    // Storage may be full — ignore
  }
};

export const clearPlanCache = () => {
  if (typeof window !== 'undefined') localStorage.removeItem(PLAN_CACHE_KEY);
};

export const fetchPlansCatalog = async (): Promise<Plan[]> => {
  const response = await api.get('/api/plans');
  const plans = Array.isArray(response.data)
    ? response.data.map(normalizePlan).filter(isPlan)
    : [];
  writeCachedPlans(plans);
  return plans;
};

export const fetchPlanById = async (planId: string): Promise<Plan | null> => {
  try {
    const response = await api.get(`/api/plans/${planId}`);
    const plan = normalizePlan(response.data);
    return isPlan(plan) ? plan : null;
  } catch {
    return null;
  }
};

export const upsertCachedPlan = (plan: Plan): Plan[] => {
  const normalizedPlan = normalizePlan(plan);
  const cachedPlans    = readCachedPlans();
  const nextPlans      = cachedPlans.filter(item => item._id !== normalizedPlan._id);
  nextPlans.unshift(normalizedPlan);
  writeCachedPlans(nextPlans);
  return nextPlans;
};

export const removeCachedPlan = (planId: string): Plan[] => {
  const nextPlans = readCachedPlans().filter(p => p._id !== planId);
  writeCachedPlans(nextPlans);
  return nextPlans;
};
