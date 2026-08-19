import express from 'express';
import {
    getPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan,
    submitPlanPayment,
    getMyPlanRequests,
    getAllPlanPaymentRequests,
    verifyPlanPayment,
} from '../controllers/planController.js';
import { protect, adminParams } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Public ───────────────────────────────────────────────────────────────────
router.get('/',    getPlans);
router.get('/:id', getPlanById);

// ── Admin Plan CRUD ──────────────────────────────────────────────────────────
router.post('/',    protect, adminParams, createPlan);
router.put('/:id',  protect, adminParams, updatePlan);
router.delete('/:id', protect, adminParams, deletePlan);

// ── User: UPI Payment Flow ───────────────────────────────────────────────────
// POST /api/plans/pay/:id  →  submit "I have paid" request
router.post('/pay/:id',    protect, submitPlanPayment);
// GET  /api/plans/my-requests  →  user sees their own requests
router.get('/my-requests', protect, getMyPlanRequests);

// ── Admin: Verify Payments ───────────────────────────────────────────────────
// GET  /api/plans/payment-requests          →  list all requests (admin)
router.get('/payment-requests',           protect, adminParams, getAllPlanPaymentRequests);
// PUT  /api/plans/payment-requests/:id     →  approve or reject
router.put('/payment-requests/:requestId', protect, adminParams, verifyPlanPayment);

export default router;
