import { User } from '../models/User.js';
import { WithdrawRequest } from '../models/WithdrawRequest.js';
import { Transaction } from '../models/Transaction.js';



// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalAdmins, pendingWithdrawals, totalWalletBalance] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'admin' }),
            WithdrawRequest.countDocuments({ status: 'pending' }),
            User.aggregate([
                { $group: { _id: null, total: { $sum: '$walletBalance' } } }
            ])
        ]);

        const balance = totalWalletBalance[0]?.total || 0;

        res.json({
            totalUsers,
            totalAdmins,
            pendingWithdrawals,
            totalWalletBalance: balance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all withdrawals
// @route   GET /api/admin/withdrawals
// @access  Private/Admin
const getAllWithdrawals = async (req, res) => {
    try {
        const withdrawals = await WithdrawRequest.find().populate('userId', 'name email mobile').sort({ createdAt: -1 });
        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or reject a withdrawal request
// @route   PUT /api/admin/withdrawals/:id
// @access  Private/Admin
const handleWithdrawal = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be approved or rejected' });
        }

        const request = await WithdrawRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Withdrawal request not found' });
        }

        request.status = status;
        if (status === 'approved') {
            request.transactionId = request.transactionId || `ADMIN_APPROVED_${Date.now()}`;
        }

        await request.save();

        await Transaction.create({
            userId: request.userId,
            type: 'withdraw',
            amount: request.amount,
            status: status === 'approved' ? 'completed' : 'failed',
            referenceId: request.transactionId || `WITHDRAW_${Date.now()}`
        });

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getDashboardStats, getAllUsers, getAllWithdrawals, handleWithdrawal };