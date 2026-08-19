import mongoose from 'mongoose';

// Added qrCode field to store per-plan UPI QR code (base64 or URL)
const planSchema = new mongoose.Schema({
    planName:    { type: String, required: true },
    image:       { type: String, default: '' },
    qrCode:      { type: String, default: '' },   // Per-plan QR code image (base64 or URL)
    price:       { type: Number, required: true },
    dailyIncome: { type: Number, required: true },
    totalIncome: { type: Number, required: true },
    duration:    { type: Number, required: true }, // days
    hashRate:    { type: String, default: '' },
}, { timestamps: true });

export const Plan = mongoose.model('Plan', planSchema);
