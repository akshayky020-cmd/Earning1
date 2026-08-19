import mongoose from 'mongoose';

const withdrawRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    fee: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    transactionId: { type: String } // set when approved
}, { timestamps: true });

export const WithdrawRequest = mongoose.model('WithdrawRequest', withdrawRequestSchema);
