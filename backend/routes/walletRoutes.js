import express from 'express';
import { depositMoney, requestWithdrawal, getTransactions, getWithdrawals } from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/deposit', protect, depositMoney);
router.post('/withdraw', protect, requestWithdrawal);
router.get('/transactions', protect, getTransactions);
router.get('/withdrawals', protect, getWithdrawals);

export default router;
