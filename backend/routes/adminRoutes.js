import express from 'express';
import { getDashboardStats, getAllUsers, getAllWithdrawals, handleWithdrawal } from '../controllers/adminController.js';
import { adminLogin } from '../controllers/authController.js';
import { updatePaymentSettings } from '../controllers/settingController.js';
import { protect, adminParams } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/stats', protect, adminParams, getDashboardStats);
router.get('/users', protect, adminParams, getAllUsers);
router.get('/withdrawals', protect, adminParams, getAllWithdrawals);
router.put('/withdrawals/:id', protect, adminParams, handleWithdrawal);
router.put('/settings', protect, adminParams, updatePaymentSettings);

export default router;

