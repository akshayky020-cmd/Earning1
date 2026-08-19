import mongoose from 'mongoose';

const userPlanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    planName: { type: String, required: true },
    price: { type: Number, required: true },
    dailyIncome: { type: Number, required: true },
    duration: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
    activationDate: { type: Date },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    expiryDate: { type: Date },
    paymentId: { type: String },
    transactionId: { type: String },
    status: { type: String, enum: ['active', 'expired', 'pending', 'cancelled'], default: 'pending' }
}, { timestamps: true });

export const UserPlan = mongoose.model('UserPlan', userPlanSchema);
