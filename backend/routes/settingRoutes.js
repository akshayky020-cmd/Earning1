import express from 'express';
import { getPaymentSettings } from '../controllers/settingController.js';

const router = express.Router();

router.get('/', getPaymentSettings);

export default router;
