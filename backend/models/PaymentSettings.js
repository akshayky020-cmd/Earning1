import mongoose from 'mongoose';

const paymentSettingsSchema = new mongoose.Schema({
  accountName: { type: String, default: '' },
  upiId: { type: String, default: '' },
  qrCodeUrl: { type: String, default: '' },
  paymentInstructions: { type: String, default: '' }
}, { timestamps: true });

export const PaymentSettings = mongoose.model('PaymentSettings', paymentSettingsSchema);
