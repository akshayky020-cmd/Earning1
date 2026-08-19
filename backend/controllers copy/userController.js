import { User } from '../models/User.js';
import { UserPlan } from '../models/UserPlan.js';
import { Transaction } from '../models/Transaction.js';

// @desc    Get user profile & dashboard data
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get active plans count
        const activePlans = await UserPlan.countDocuments({ userId: req.user.id, status: 'active' });

        // Get total earnings (income type transactions)
        const incomeTransactions = await Transaction.find({ userId: req.user.id, type: 'income', status: 'completed' });
        const totalEarnings = incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);

        // Get referral earnings
        const referralTransactions = await Transaction.find({ userId: req.user.id, type: 'referral', status: 'completed' });
        const referralEarnings = referralTransactions.reduce((acc, curr) => acc + curr.amount, 0);

        res.json({
            ...user._doc,
            activePlans,
            totalEarnings,
            referralEarnings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user plans
// @route   GET /api/users/plans
// @access  Private
const getUserPlans = async (req, res) => {
    try {
        const plans = await UserPlan.find({ userId: req.user.id }).populate('planId');
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getUserProfile, getUserPlans };
