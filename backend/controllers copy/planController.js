import { Plan } from '../models/Plan.js';
import { UserPlan } from '../models/UserPlan.js';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';

// @desc    Get all plans
// @route   GET /api/plans
// @access  Public
const getPlans = async (req, res) => {
    try {
        const plans = await Plan.find({});
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new plan
// @route   POST /api/plans
// @access  Private/Admin
const createPlan = async (req, res) => {
    try {
        const { planName, image, price, dailyIncome, totalIncome, duration } = req.body;
        const plan = await Plan.create({ planName, image, price, dailyIncome, totalIncome, duration });
        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a plan
// @route   PUT /api/plans/:id
// @access  Private/Admin
const updatePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a plan
// @route   DELETE /api/plans/:id
// @access  Private/Admin
const deletePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndDelete(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        res.json({ message: 'Plan removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Buy a plan
// @route   POST /api/plans/buy/:id
// @access  Private
const buyPlan = async (req, res) => {
    try {
        const planId = req.params.id;
        const userId = req.user.id;

        const plan = await Plan.findById(planId);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        const user = await User.findById(userId);
        if (user.walletBalance < plan.price) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Deduct balance
        user.walletBalance -= plan.price;

        // Referral Commission Logic (5% to Level 1)
        if (user.referredBy) {
            const referrer = await User.findOne({ referralCode: user.referredBy });
            if (referrer) {
                const commission = (plan.price * 5) / 100;
                referrer.walletBalance += commission;
                await referrer.save();

                await Transaction.create({
                    userId: referrer._id,
                    type: 'referral',
                    amount: commission,
                    status: 'completed',
                    referenceId: user._id.toString()
                });
            }
        }

        await user.save();

        // Create User Plan
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration);

        const userPlan = await UserPlan.create({
            userId,
            planId,
            startDate: new Date(),
            endDate,
            status: 'active'
        });

        // Record Transaction
        await Transaction.create({
            userId,
            type: 'plan_purchase',
            amount: plan.price,
            status: 'completed'
        });

        res.status(201).json(userPlan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getPlans, createPlan, updatePlan, deletePlan, buyPlan };
