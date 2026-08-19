import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Setup multer for upload with strict filter and limits
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Sanitize original name to prevent directory traversal
        const safeName = `bg-removed-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname).toLowerCase()}`;
        cb(null, safeName);
    }
});

const fileFilter = (req, file, cb) => {
    // Only allow common secure image mime types
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    const fileMime = file.mimetype.toLowerCase();
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimeTypes.includes(fileMime) && allowedExtensions.includes(fileExt)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.'), false);
    }
};

const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
    },
    fileFilter
});

// @desc    Process Image (Mock AI Background Removal)
// @route   POST /api/image/process
// @access  Private
router.post('/process', protect, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading (e.g. file size exceeded)
            return res.status(400).json({ message: err.message });
        } else if (err) {
            // An unknown error occurred when uploading (e.g. invalid file type)
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        // Mock AI background removal delay
        setTimeout(() => {
            res.json({
                message: 'Image processed successfully',
                originalImage: `/uploads/${req.file.filename}`,
                processedImage: `/uploads/${req.file.filename}`,
                processedAt: new Date()
            });
        }, 2000);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
