import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

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
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    walletBalance: user.walletBalance,
    token: generateAccessToken(user.id),
    refreshToken: generateRefreshToken(user.id)
});

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, mobile, password, referralCode } = req.body;

        const normalizedEmail = String(email || '').trim().toLowerCase();
        const normalizedMobile = String(mobile || '').trim();

        const userExists = await User.findOne({ $or: [{ email: normalizedEmail }, { mobile: normalizedMobile }] });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with that email or mobile' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const myReferralCode = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();

        const user = await User.create({
            name,
            email: normalizedEmail,
            mobile: normalizedMobile,
            password: hashedPassword,
            referralCode: myReferralCode,
            referredBy: referralCode || null,
            role: 'user'
        });

        if (user) {
            return res.status(201).json(buildUserResponse(user));
        }

        return res.status(400).json({ message: 'Invalid user data' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
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
        const { email, password } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(String(password || ''), user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        return res.json(buildUserResponse(user));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail, role: 'admin' });
        if (!user) {
            return res.status(401).json({ message: 'Admin account not found' });
        }

        const isMatch = await bcrypt.compare(String(password || ''), user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        return res.json(buildUserResponse(user));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export { register, login, adminLogin, refreshToken }