import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deposit', 'withdraw', 'income', 'referral', 'plan_purchase'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
    referenceId: { type: String },
    paymentId: { type: String },
    orderId: { type: String },
    transactionId: { type: String },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    planName: { type: String },
    planDetails: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export const Transaction = mongoose.model('Transaction', transactionSchema);
