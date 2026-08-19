import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { WithdrawRequest } from '../models/WithdrawRequest.js';

// @desc    Deposit Money (Mock Razorpay Integration)
// @route   POST /api/wallet/deposit
// @access  Private
const depositMoney = async (req, res) => {
    try {
        const { amount, razorpayPaymentId } = req.body;
        const user = await User.findById(req.user.id);

        user.walletBalance += amount;
        await user.save();

        await Transaction.create({
            userId: user._id,
            type: 'deposit',
            amount,
            status: 'completed',
            referenceId: razorpayPaymentId || `MOCK_DEP_${Date.now()}`
        });

        res.json({ message: 'Deposit successful', walletBalance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request Withdrawal
// @route   POST /api/wallet/withdraw
// @access  Private
const requestWithdrawal = async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.user.id);

        if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
        if (user.walletBalance < amount) return res.status(400).json({ message: 'Insufficient balance' });

        const fee = amount * 0.10; // 10% processing fee
        const finalAmount = amount - fee;

        // Deduct immediately on request
        user.walletBalance -= amount;
        await user.save();

        const request = await WithdrawRequest.create({
            userId: user._id,
            amount,
            fee,
            finalAmount,
            status: 'pending'
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get User Transactions
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort('-createdAt');
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get User Withdrawal Requests
// @route   GET /api/wallet/withdrawals
// @access  Private
const getWithdrawals = async (req, res) => {
    try {
        const requests = await WithdrawRequest.find({ userId: req.user.id }).sort('-createdAt');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { depositMoney, requestWithdrawal, getTransactions, getWithdrawals };
