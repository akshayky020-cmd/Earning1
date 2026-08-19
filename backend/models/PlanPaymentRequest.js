import mongoose from 'mongoose';

// Stores user's UPI plan purchase requests (pending admin verification)
const planPaymentRequestSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
    planId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Plan',  required: true },
    planName:  { type: String,  required: true },
    amount:    { type: Number,  required: true },
    utrNumber: { type: String,  default: '' },
    screenshot:{ type: String,  default: '' },  // base64 or URL
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminNote:      { type: String, default: '' },
    reviewedAt:     { type: Date },
    reviewedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Populated after approval
    userPlanId:     { type: mongoose.Schema.Types.ObjectId, ref: 'UserPlan' },
    transactionId:  { type: String }
}, { timestamps: true });

planPaymentRequestSchema.index({ userId: 1, status: 1 });
planPaymentRequestSchema.index({ status: 1, createdAt: -1 });

export const PlanPaymentRequest = mongoose.model('PlanPaymentRequest', planPaymentRequestSchema);
