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
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard statistics.' });
    }
};

// @desc    Get all users (paginated)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [users, totalCount] = await Promise.all([
            User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            User.countDocuments()
        ]);

        res.json({
            users,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
};

// @desc    Get all withdrawals (paginated)
// @route   GET /api/admin/withdrawals
// @access  Private/Admin
const getAllWithdrawals = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [withdrawals, totalCount] = await Promise.all([
            WithdrawRequest.find()
                .populate('userId', 'name email mobile')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            WithdrawRequest.countDocuments()
        ]);

        res.json({
            withdrawals,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        console.error('Get withdrawals error:', error);
        res.status(500).json({ message: 'Failed to fetch withdrawal requests.' });
    }
};

// @desc    Approve or reject a withdrawal request
// @route   PUT /api/admin/withdrawals/:id
// @access  Private/Admin
const handleWithdrawal = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        // Validate status
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be approved or rejected' });
        }

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid withdrawal request ID.' });
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
        console.error('Withdrawal handling error:', error);
        res.status(500).json({ message: 'Failed to process withdrawal request.' });
    }
};

export { getDashboardStats, getAllUsers, getAllWithdrawals, handleWithdrawal };