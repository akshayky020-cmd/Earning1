import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { WithdrawRequest } from '../models/WithdrawRequest.js';

const MIN_AMOUNT = 10;
const MAX_AMOUNT = 1000000;
const WITHDRAWAL_FEE_PERCENT = 10;

// Helper to validate amount
const validateAmount = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return { valid: false, message: 'Amount must be a valid number.' };
    }
    if (amount < MIN_AMOUNT) {
        return { valid: false, message: `Minimum deposit/withdrawal amount is ₹${MIN_AMOUNT}.` };
    }
    if (amount > MAX_AMOUNT) {
        return { valid: false, message: `Maximum deposit/withdrawal amount is ₹${MAX_AMOUNT}.` };
    }
    if (!Number.isFinite(amount) || amount % 0.01 !== 0) {
        return { valid: false, message: 'Amount must be a valid number with up to 2 decimal places.' };
    }
    return { valid: true };
};

// @desc    Deposit Money (Mock Razorpay Integration)
// @route   POST /api/wallet/deposit
// @access  Private
const depositMoney = async (req, res) => {
    try {
        const { amount, razorpayPaymentId } = req.body;

        const amountValidation = validateAmount(amount);
        if (!amountValidation.valid) {
            return res.status(400).json({ message: amountValidation.message });
        }

        // Clean payment ID string validation (basic check)
        const paymentId = razorpayPaymentId 
            ? String(razorpayPaymentId).replace(/[^\w_-]/g, '').substring(0, 100)
            : `MOCK_DEP_${Date.now()}`;

        // Atomic balance increment to prevent race conditions
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $inc: { walletBalance: amount } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await Transaction.create({
            userId: user._id,
            type: 'deposit',
            amount,
            status: 'completed',
            referenceId: paymentId
        });

        console.log(`[DEPOSIT] User ${user._id} deposited ₹${amount}`);
        res.status(201).json({ message: 'Deposit successful', walletBalance: user.walletBalance });
    } catch (error) {
        console.error('[DEPOSIT ERROR]', error);
        res.status(500).json({ message: 'Failed to process deposit.' });
    }
};

// @desc    Request Withdrawal
// @route   POST /api/wallet/withdraw
// @access  Private
const requestWithdrawal = async (req, res) => {
    try {
        const { amount } = req.body;

        const amountValidation = validateAmount(amount);
        if (!amountValidation.valid) {
            return res.status(400).json({ message: amountValidation.message });
        }

        // Thread-safe atomic balance check and deduction in a single step
        const user = await User.findOneAndUpdate(
            { _id: req.user.id, walletBalance: { $gte: amount } },
            { $inc: { walletBalance: -amount } },
            { new: true }
        );

        if (!user) {
            return res.status(400).json({ message: 'Insufficient balance or user not found' });
        }

        const fee = Math.round(amount * (WITHDRAWAL_FEE_PERCENT / 100) * 100) / 100;
        const finalAmount = Math.round((amount - fee) * 100) / 100;

        const request = await WithdrawRequest.create({
            userId: user._id,
            amount,
            fee,
            finalAmount,
            status: 'pending'
        });

        console.log(`[WITHDRAWAL] User ${user._id} requested withdrawal of ₹${amount}`);
        res.status(201).json(request);
    } catch (error) {
        console.error('[WITHDRAWAL ERROR]', error);
        res.status(500).json({ message: 'Failed to request withdrawal.' });
    }
};

// @desc    Get User Transactions (Paginated)
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [transactions, totalCount] = await Promise.all([
            Transaction.find({ userId: req.user.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Transaction.countDocuments({ userId: req.user.id })
        ]);

        res.json({
            transactions,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        console.error('[GET TRANSACTIONS ERROR]', error);
        res.status(500).json({ message: 'Failed to fetch transactions.' });
    }
};

// @desc    Get User Withdrawal Requests (Paginated)
// @route   GET /api/wallet/withdrawals
// @access  Private
const getWithdrawals = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [requests, totalCount] = await Promise.all([
            WithdrawRequest.find({ userId: req.user.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            WithdrawRequest.countDocuments({ userId: req.user.id })
        ]);

        res.json({
            withdrawals: requests,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        console.error('[GET WITHDRAWALS ERROR]', error);
        res.status(500).json({ message: 'Failed to fetch withdrawal requests.' });
    }
};

export { depositMoney, requestWithdrawal, getTransactions, getWithdrawals };
