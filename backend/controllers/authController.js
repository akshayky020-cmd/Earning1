import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Password validation helper - enforces strong password policy
const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password must be a string.' };
    }
    if (password.length < 8 || password.length > 128) {
        return { valid: false, message: 'Password must be between 8 and 128 characters.' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter.' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter.' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number.' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*).' };
    }
    return { valid: true };
};

const generateAccessToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );
};

const generateRefreshToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
};

const buildUserResponse = (user) => ({
    _id: user.id,
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    walletBalance: user.walletBalance || 0,
    token: generateAccessToken(user.id),
    refreshToken: generateRefreshToken(user.id)
});

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, mobile, password, referralCode } = req.body;

        // Input validation
        if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 50) {
            return res.status(400).json({ message: 'Name must be between 2 and 50 characters.' });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        if (!email || !emailRegex.test(normalizedEmail) || normalizedEmail.length > 255) {
            return res.status(400).json({ message: 'Please provide a valid email address.' });
        }

        const mobileRegex = /^[0-9]{10}$/;
        const normalizedMobile = String(mobile || '').trim();
        if (!mobile || !mobileRegex.test(normalizedMobile)) {
            return res.status(400).json({ message: 'Mobile number must be a 10-digit numeric string.' });
        }

        if (!password || typeof password !== 'string' || password.length < 8 || password.length > 128) {
            return res.status(400).json({ message: 'Password must be between 8 and 128 characters.' });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ message: passwordValidation.message });
        }

        const userExists = await User.findOne({ $or: [{ email: normalizedEmail }, { mobile: normalizedMobile }] });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with that email or mobile' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const myReferralCode = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            mobile: normalizedMobile,
            password: hashedPassword,
            referralCode: myReferralCode,
            referredBy: referralCode ? String(referralCode).trim() : null,
            role: 'user'
        });

        if (user) {
            return res.status(201).json(buildUserResponse(user));
        }

        return res.status(400).json({ message: 'Invalid user data' });
    } catch (error) {
        return res.status(500).json({ message: 'Registration failed.' });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== 'string') {
        return res.status(401).json({ message: 'Refresh token required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        res.json({
            token: generateAccessToken(user.id)
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, mobile, password } = req.body;

        const identifier = String(email || mobile || '').trim().toLowerCase();
        
        if (!identifier || identifier.length > 255) {
            return res.status(400).json({ message: 'Please provide a valid email or mobile number.' });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Password is required.' });
        }

        const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        return res.json(buildUserResponse(user));
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Login failed.' });
    }
};

// @desc    Authenticate admin
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const normalizedEmail = String(email || '').trim().toLowerCase();
        if (!email || normalizedEmail.length > 255) {
            return res.status(400).json({ message: 'Please provide a valid email.' });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Password is required.' });
        }

        const user = await User.findOne({ $or: [{ email: normalizedEmail }, { mobile: normalizedEmail }], role: 'admin' });
        if (!user) {
            return res.status(401).json({ message: 'Admin account not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        return res.json(buildUserResponse(user));
    } catch (error) {
        return res.status(500).json({ message: 'Admin authentication failed.' });
    }
};

export { register, login, adminLogin, refreshToken }