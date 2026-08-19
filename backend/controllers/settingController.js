import { PaymentSettings } from '../models/PaymentSettings.js';

// @desc    Get payment settings
// @route   GET /api/settings
// @access  Public
export const getPaymentSettings = async (req, res) => {
    try {
        let settings = await PaymentSettings.findOne();
        if (!settings) {
            settings = await PaymentSettings.create({
                accountName: 'Company Account',
                upiId: '6202365846-3@ibl',
                qrCodeUrl: '',
                paymentInstructions: 'Scan QR code or use UPI ID to complete payment, then upload screenshot.'
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update payment settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updatePaymentSettings = async (req, res) => {
    try {
        const { accountName, upiId, qrCodeUrl, paymentInstructions } = req.body;
        let settings = await PaymentSettings.findOne();
        if (!settings) {
            settings = new PaymentSettings({});
        }
        settings.accountName = accountName !== undefined ? accountName : settings.accountName;
        settings.upiId = upiId !== undefined ? upiId : settings.upiId;
        settings.qrCodeUrl = qrCodeUrl !== undefined ? qrCodeUrl : settings.qrCodeUrl;
        settings.paymentInstructions = paymentInstructions !== undefined ? paymentInstructions : settings.paymentInstructions;
        
        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
