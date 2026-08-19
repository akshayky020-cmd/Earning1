import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 0, min: 0 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: String, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// Note: email, mobile, and referralCode already have indexes from 'unique: true'
// Create index only for role field
userSchema.index({ role: 1 });

export const User = mongoose.model('User', userSchema);
