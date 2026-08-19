import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Strong default password (MUST be changed in production!)
// Format: Password + Timestamp to ensure uniqueness
const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@earning.com';
const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'SecureAdmin@2026!NewPassword123';

if (!adminPassword || adminPassword.includes('change_this_password')) {
    console.error('ERROR: DEFAULT_ADMIN_PASSWORD must be set to a strong password in .env file!');
    console.error('Password must contain: uppercase, lowercase, numbers, and special characters.');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
        console.log('Admin already exists:', existingAdmin.email);
        console.log('⚠️  SECURITY WARNING: Change the default admin password immediately!');
        console.log('📝 Run: npm run update-admin-password');
        await mongoose.disconnect();
        process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(adminPassword, salt);

    await User.create({
        name: 'Super Admin',
        email: adminEmail,
        mobile: '0000000000',
        password,
        role: 'admin'
    });

    console.log('✅ Default admin created:', adminEmail);
    console.log('🔐 IMPORTANT: Change the admin password on first login!');
    console.log('⚠️  Default credentials should never be used in production.');
    await mongoose.disconnect();
    process.exit(0);
}).catch(err => {
    console.error('❌ Connection Error:', err.message);
    process.exit(1);
});
