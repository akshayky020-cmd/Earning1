import mongoose from 'mongoose';
import { Plan }               from '../models/Plan.js';
import { UserPlan }           from '../models/UserPlan.js';
import { Transaction }        from '../models/Transaction.js';
import { PlanPaymentRequest } from '../models/PlanPaymentRequest.js';
import { User }               from '../models/User.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

const serializePlan = (plan) => ({
    _id:         plan._id,
    planName:    plan.planName,
    image:       plan.image || '',
    qrCode:      plan.qrCode || '',
    price:       Number(plan.price    || 0),
    dailyIncome: Number(plan.dailyIncome || 0),
    totalIncome: Number(plan.totalIncome || 0),
    duration:    Number(plan.duration  || 0),
    hashRate:    plan.hashRate || '',
    createdAt:   plan.createdAt,
    updatedAt:   plan.updatedAt,
});

// ─── Public Plan Endpoints ───────────────────────────────────────────────────

// @desc    Get all plans
// @route   GET /api/plans
// @access  Public
export const getPlans = async (req, res) => {
    try {
        const plans = await Plan.find({}).sort({ createdAt: -1 }).lean();
        res.json(plans.map(serializePlan));
    } catch (error) {
        console.error('[GET_PLANS_ERROR]', error);
        res.status(500).json({ message: 'Failed to fetch plans' });
    }
};

// @desc    Get a single plan by ID
// @route   GET /api/plans/:id
// @access  Public
export const getPlanById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Plan ID.' });
        }
        const plan = await Plan.findById(id).lean();
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        return res.json(serializePlan(plan));
    } catch (error) {
        console.error('[GET_PLAN_BY_ID_ERROR]', error);
        return res.status(500).json({ message: 'Failed to fetch plan details.' });
    }
};

// ─── Admin Plan CRUD ─────────────────────────────────────────────────────────

// @desc    Create a new plan
// @route   POST /api/plans
// @access  Private/Admin
export const createPlan = async (req, res) => {
    try {
        const { planName, image, qrCode, price, dailyIncome, totalIncome, duration, hashRate } = req.body;

        if (!planName || typeof planName !== 'string' || planName.trim() === '') {
            return res.status(400).json({ message: 'Invalid or missing plan name.' });
        }
        if (typeof price !== 'number' || price < 0 || price > 1000000) {
            return res.status(400).json({ message: 'Price must be a valid positive number.' });
        }
        if (typeof dailyIncome !== 'number' || dailyIncome < 0 || dailyIncome > 100000) {
            return res.status(400).json({ message: 'Daily income must be a valid positive number.' });
        }
        if (typeof totalIncome !== 'number' || totalIncome < 0 || totalIncome > 10000000) {
            return res.status(400).json({ message: 'Total income must be a valid positive number.' });
        }
        if (typeof duration !== 'number' || duration <= 0 || duration > 3650) {
            return res.status(400).json({ message: 'Duration must be a valid positive integer.' });
        }

        const plan = await Plan.create({
            planName: planName.trim(),
            image:       image      || '',
            qrCode:      qrCode     || '',
            price,
            dailyIncome,
            totalIncome,
            duration,
            hashRate: hashRate || '',
        });
        res.status(201).json(serializePlan(plan));
    } catch (error) {
        console.error('[CREATE_PLAN_ERROR]', error);
        res.status(500).json({ message: 'Failed to create plan' });
    }
};

// @desc    Update a plan
// @route   PUT /api/plans/:id
// @access  Private/Admin
export const updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Plan ID.' });
        }

        const { planName, image, qrCode, price, dailyIncome, totalIncome, duration, hashRate } = req.body;

        if (planName    !== undefined && (typeof planName !== 'string' || planName.trim() === '')) {
            return res.status(400).json({ message: 'Plan name must be a non-empty string.' });
        }
        if (price       !== undefined && (typeof price !== 'number' || price < 0 || price > 1000000)) {
            return res.status(400).json({ message: 'Price must be a valid positive number.' });
        }
        if (dailyIncome !== undefined && (typeof dailyIncome !== 'number' || dailyIncome < 0 || dailyIncome > 100000)) {
            return res.status(400).json({ message: 'Daily income must be a valid positive number.' });
        }
        if (totalIncome !== undefined && (typeof totalIncome !== 'number' || totalIncome < 0 || totalIncome > 10000000)) {
            return res.status(400).json({ message: 'Total income must be a valid positive number.' });
        }
        if (duration    !== undefined && (typeof duration !== 'number' || duration <= 0 || duration > 3650)) {
            return res.status(400).json({ message: 'Duration must be a valid positive integer.' });
        }

        const updateFields = {};
        if (planName    !== undefined) updateFields.planName    = planName.trim();
        if (image       !== undefined) updateFields.image       = image;
        if (qrCode      !== undefined) updateFields.qrCode      = qrCode;
        if (price       !== undefined) updateFields.price       = price;
        if (dailyIncome !== undefined) updateFields.dailyIncome = dailyIncome;
        if (totalIncome !== undefined) updateFields.totalIncome = totalIncome;
        if (duration    !== undefined) updateFields.duration    = duration;
        if (hashRate    !== undefined) updateFields.hashRate    = hashRate;

        const plan = await Plan.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        res.json(serializePlan(plan));
    } catch (error) {
        console.error('[UPDATE_PLAN_ERROR]', error);
        res.status(500).json({ message: 'Failed to update plan' });
    }
};

// @desc    Delete a plan
// @route   DELETE /api/plans/:id
// @access  Private/Admin
export const deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Plan ID.' });
        }
        const plan = await Plan.findByIdAndDelete(id);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        res.json({ message: 'Plan removed' });
    } catch (error) {
        console.error('[DELETE_PLAN_ERROR]', error);
        res.status(500).json({ message: 'Failed to delete plan' });
    }
};

// ─── UPI Payment Flow ─────────────────────────────────────────────────────────

// @desc    Submit a UPI payment request for a plan (user clicks "I Have Paid")
// @route   POST /api/plans/pay/:id
// @access  Private
export const submitPlanPayment = async (req, res) => {
    try {
        const planId = req.params.id;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(planId)) {
            return res.status(400).json({ message: 'Invalid Plan ID.' });
        }

        const plan = await Plan.findById(planId);
        if (!plan) return res.status(404).json({ message: 'Plan not found.' });

        // Check if user already has a pending request for this plan
        const existingPending = await PlanPaymentRequest.findOne({
            userId,
            planId,
            status: 'pending',
        });
        if (existingPending) {
            return res.status(400).json({
                message: 'You already have a pending payment request for this plan. Please wait for admin verification.',
            });
        }

        // Check if user already has this plan active
        const existingActive = await UserPlan.findOne({ userId, planId, status: 'active' });
        if (existingActive) {
            return res.status(400).json({ message: 'You already have this plan active.' });
        }

        const { utrNumber, screenshot } = req.body;

        const paymentRequest = await PlanPaymentRequest.create({
            userId,
            planId,
            planName:  plan.planName,
            amount:    Number(plan.price),
            utrNumber: utrNumber ? String(utrNumber).trim().substring(0, 50) : '',
            screenshot: screenshot || '',
            status:    'pending',
        });

        res.status(201).json({
            success: true,
            message: 'Payment request submitted. It will be verified by the admin within 24 hours.',
            requestId: paymentRequest._id,
        });
    } catch (error) {
        console.error('[SUBMIT_PLAN_PAYMENT_ERROR]', error);
        res.status(500).json({ message: 'Failed to submit payment request.' });
    }
};

// @desc    Get current user's plan payment requests
// @route   GET /api/plans/my-requests
// @access  Private
export const getMyPlanRequests = async (req, res) => {
    try {
        const requests = await PlanPaymentRequest.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .lean();
        res.json(requests);
    } catch (error) {
        console.error('[GET_MY_REQUESTS_ERROR]', error);
        res.status(500).json({ message: 'Failed to fetch payment requests.' });
    }
};

// ─── Admin: Verify Plan Payments ─────────────────────────────────────────────

// @desc    Get all pending plan payment requests
// @route   GET /api/plans/payment-requests
// @access  Private/Admin
export const getAllPlanPaymentRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            filter.status = status;
        }

        const requests = await PlanPaymentRequest.find(filter)
            .populate('userId',  'name email mobile')
            .populate('planId',  'planName price duration dailyIncome totalIncome')
            .sort({ createdAt: -1 })
            .lean();

        res.json(requests);
    } catch (error) {
        console.error('[GET_ALL_PAYMENT_REQUESTS_ERROR]', error);
        res.status(500).json({ message: 'Failed to fetch payment requests.' });
    }
};

// @desc    Approve or reject a plan payment request
// @route   PUT /api/plans/payment-requests/:requestId
// @access  Private/Admin
export const verifyPlanPayment = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action, adminNote } = req.body; // action: 'approve' | 'reject'

        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ message: 'Invalid request ID.' });
        }
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Action must be "approve" or "reject".' });
        }

        const paymentRequest = await PlanPaymentRequest.findById(requestId);
        if (!paymentRequest) {
            return res.status(404).json({ message: 'Payment request not found.' });
        }
        if (paymentRequest.status !== 'pending') {
            return res.status(400).json({ message: `This request has already been ${paymentRequest.status}.` });
        }

        if (action === 'reject') {
            paymentRequest.status     = 'rejected';
            paymentRequest.adminNote  = adminNote || '';
            paymentRequest.reviewedAt = new Date();
            paymentRequest.reviewedBy = req.user.id;
            await paymentRequest.save();

            return res.json({
                success: true,
                message: 'Payment request rejected.',
                request: paymentRequest,
            });
        }

        // ── APPROVE ──────────────────────────────────────────────────────────
        const plan = await Plan.findById(paymentRequest.planId);
        if (!plan) {
            return res.status(404).json({ message: 'Associated plan no longer exists.' });
        }

        // Guard: make sure user doesn't already have an active plan
        const existingActive = await UserPlan.findOne({
            userId: paymentRequest.userId,
            planId: paymentRequest.planId,
            status: 'active',
        });
        if (existingActive) {
            paymentRequest.status    = 'rejected';
            paymentRequest.adminNote = 'User already has this plan active.';
            paymentRequest.reviewedAt= new Date();
            await paymentRequest.save();
            return res.status(400).json({ message: 'User already has this plan active.' });
        }

        const now        = new Date();
        const expiryDate = new Date(now);
        expiryDate.setDate(expiryDate.getDate() + Number(plan.duration || 0));

        const txnId = `TXN_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

        // 1. Create UserPlan (activate investment)
        const userPlan = await UserPlan.create({
            userId:         paymentRequest.userId,
            planId:         plan._id,
            planName:       plan.planName,
            price:          plan.price,
            dailyIncome:    plan.dailyIncome,
            duration:       plan.duration,
            purchaseDate:   now,
            activationDate: now,
            startDate:      now,
            endDate:        expiryDate,
            expiryDate,
            paymentId:      paymentRequest._id.toString(),
            transactionId:  txnId,
            status:         'active',
        });

        // 2. Record transaction
        await Transaction.create({
            userId:      paymentRequest.userId,
            type:        'plan_purchase',
            amount:      Number(plan.price),
            status:      'completed',
            referenceId: paymentRequest._id.toString(),
            transactionId: txnId,
            planId:      plan._id,
            planName:    plan.planName,
            planDetails: {
                planId:      plan._id.toString(),
                planName:    plan.planName,
                price:       Number(plan.price),
                dailyIncome: Number(plan.dailyIncome),
                totalIncome: Number(plan.totalIncome),
                duration:    Number(plan.duration),
                utrNumber:   paymentRequest.utrNumber,
            },
        });

        // 3. Update payment request status
        paymentRequest.status        = 'approved';
        paymentRequest.adminNote     = adminNote || '';
        paymentRequest.reviewedAt    = now;
        paymentRequest.reviewedBy    = req.user.id;
        paymentRequest.userPlanId    = userPlan._id;
        paymentRequest.transactionId = txnId;
        await paymentRequest.save();

        return res.json({
            success: true,
            message: 'Payment approved. Plan activated successfully.',
            request: paymentRequest,
            userPlan,
        });
    } catch (error) {
        console.error('[VERIFY_PLAN_PAYMENT_ERROR]', error);
        res.status(500).json({ message: 'Failed to verify payment request.' });
    }
};
