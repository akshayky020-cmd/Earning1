import { User } from '../models/User.js';
import { UserPlan } from '../models/UserPlan.js';
import { Transaction } from '../models/Transaction.js';

const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

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

        // Get purchased plans
        const userPlans = await UserPlan.find({ userId: req.user.id }).populate('planId');
        const purchasedPlans = userPlans
            .filter(up => up.planId !== null)
            .map(up => ({
                id: up._id.toString(),
                planId: up.planId._id.toString(),
                planName: up.planName || up.planId.planName,
                price: up.price ?? up.planId.price,
                dailyIncome: up.dailyIncome ?? up.planId.dailyIncome,
                duration: up.duration ?? up.planId.duration,
                purchaseDate: formatDate(up.purchaseDate || up.startDate || up.createdAt),
                activationDate: formatDate(up.activationDate || up.startDate || up.createdAt),
                expiryDate: formatDate(up.expiryDate || up.endDate),
                paymentId: up.paymentId || '',
                transactionId: up.transactionId || '',
                status: up.status
            }));

        res.json({
            ...user._doc,
            activePlans,
            totalEarnings,
            referralEarnings,
            purchasedPlans
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
