# 🚀 PRODUCTION DEPLOYMENT & IMPLEMENTATION GUIDE

## Quick Start - Apply All Fixes

### 1. Backend Setup & Verification

```bash
cd backend

# Install dependencies (if not already installed)
npm install

# Generate new JWT secrets for production
# IMPORTANT: Replace these in .env file!
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
echo "Access Secret: $JWT_ACCESS_SECRET"
echo "Refresh Secret: $JWT_REFRESH_SECRET"

# Verify seed admin script
node seedAdmin.js
# Expected: "✅ Default admin created: admin@earning.com"

# Test backend startup
npm start
# Should show: "Server running at http://localhost:5001"
# Should show: "MongoDB Connected Successfully"
```

### 2. Frontend Setup & Verification

```bash
cd Frontend

# Install dependencies
npm install

# Type check (should pass with 0 errors)
npm run lint

# Build production bundle
npm run build

# Test dev server
npm run dev
# Should be accessible at http://localhost:3001
```

### 3. Environment Configuration

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Server
PORT=5001
NODE_ENV=production

# Security - GENERATE NEW VALUES!
JWT_ACCESS_SECRET=<your-generated-32-hex-string>
JWT_REFRESH_SECRET=<your-generated-32-hex-string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Payment
RAZORPAY_KEY_ID=your_production_key
RAZORPAY_KEY_SECRET=your_production_secret

# Frontend
FRONTEND_URL=https://yourdomain.com

# Admin
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DEFAULT_ADMIN_PASSWORD=<strong-password-with-uppercase-numbers-special>
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=https://api.yourdomain.com
APP_URL=https://yourdomain.com
```

---

## ✅ VERIFICATION CHECKLIST

### Security Fixes Applied
- [x] Fixed broken Authorization header in API interceptor
- [x] Migrated auth tokens from localStorage to sessionStorage
- [x] Enhanced Helmet security headers with CSP & HSTS
- [x] Improved CORS to restrict methods (removed OPTIONS)
- [x] Strengthened password policy (8+ chars, uppercase, lowercase, numbers, special)
- [x] Added unique constraint to referralCode
- [x] Implemented stricter admin login rate limiting (5 attempts/15min)
- [x] Added pagination to admin queries (users, withdrawals)
- [x] Created .env.example with secure defaults
- [x] Added error logging and structured messages
- [x] Updated seedAdmin.js with security warnings
- [x] Enhanced wallet validation with constants

### TypeScript/Build Checks
- [x] Frontend TypeScript compilation (0 errors)
- [x] Backend Node.js syntax check (passed)
- [x] Redux/Redux Toolkit compatibility (verified)
- [x] React Router v7 routing (verified)

### Database Indexes Added
- [x] User: email, mobile, referralCode, role
- [x] Transaction: userId with pagination
- [x] WithdrawRequest: userId with pagination

### API Endpoints Protected
- [x] `/api/auth/login` - Rate limited (10 attempts/15min)
- [x] `/api/auth/register` - Rate limited (10 attempts/15min)
- [x] `/api/admin/login` - Rate limited (5 attempts/15min) ⭐ STRICT
- [x] `/api/admin/*` - Admin role required
- [x] `/api/wallet/*` - User authentication required
- [x] `/api/users/*` - User authentication required

---

## 🧪 TESTING - MANUAL VERIFICATION

### Test 1: Password Validation
```bash
# Should FAIL - Too short
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","mobile":"1234567890","password":"weak"}'
# Expected: "Password must be between 8 and 128 characters"

# Should FAIL - No uppercase
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","mobile":"1234567890","password":"lowercase123!"}'
# Expected: "Password must contain at least one uppercase letter"

# Should SUCCEED - Strong password
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","mobile":"1234567890","password":"StrongPass123!"}'
# Expected: 201 Created with user data and token
```

### Test 2: Rate Limiting
```bash
# Run in loop - should fail after 5 attempts
for i in {1..7}; do
  curl -X POST http://localhost:5001/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@earning.com","password":"wrong"}' 2>/dev/null | jq .
done
# Expected: After 5 attempts: "Too many admin login attempts"
```

### Test 3: Authorization Header
```bash
# Frontend client API test
curl -X GET http://localhost:5001/api/users/profile \
  -H "Authorization: Bearer invalid_token"
# Expected: 401 Unauthorized

# Valid token should work
TOKEN=$(curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123!"}' 2>/dev/null | jq -r .token)

curl -X GET http://localhost:5001/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200 OK with user profile
```

### Test 4: Admin Access Control
```bash
# Non-admin user token attempting admin endpoint
curl -X GET http://localhost:5001/api/admin/stats \
  -H "Authorization: Bearer $USER_TOKEN"
# Expected: 403 Forbidden "Not authorized as admin"

# Admin token
curl -X GET http://localhost:5001/api/admin/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Expected: 200 OK with dashboard stats
```

### Test 5: Pagination
```bash
# Get users with pagination
curl -X GET "http://localhost:5001/api/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Expected: 200 OK with users array and pagination metadata
{
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 25,
    "totalPages": 3
  }
}
```

### Test 6: CORS Headers
```bash
# Check CORS headers
curl -i -X OPTIONS http://localhost:5001/api/auth/login \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST"
# Expected: 
# Access-Control-Allow-Origin: http://localhost:3001
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE
# (No OPTIONS in methods list)
```

---

## 🔒 SECURITY TESTING

### XSS Prevention Test
```javascript
// Try stored XSS in user name
POST /api/auth/register
{
  "name": "<img src=x onerror='alert(1)'>",
  "email": "test@test.com",
  "mobile": "1234567890",
  "password": "StrongPass123!"
}
// Should sanitize the input - check dashboard for safe rendering
```

### NoSQL Injection Test
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":{"$ne":null},"password":"anything"}'
# Expected: Sanitized/rejected, should not bypass auth
```

### CSRF Check
```javascript
// All state-changing requests should require Authorization header
// Form-based CSRF should be prevented (we use JWT, not cookie-based sessions)
```

---

## 🚀 DEPLOYMENT TO PRODUCTION

### Using cPanel (from Deployment_Guide_cPanel.md)

1. **Build Frontend**
   ```bash
   cd Frontend
   npm run build  # Creates dist/ folder
   ```

2. **Upload to cPanel**
   - ZIP contents of `Frontend/dist/`
   - Upload to `public_html/`
   - Create `.htaccess` for React routing (see guide)

3. **Deploy Backend**
   - ZIP `backend/` (exclude node_modules)
   - Upload via cPanel File Manager
   - Create Node.js app in cPanel
   - Set startup file: `server.js`
   - Run: `npm install && npm start`

4. **Environment Variables**
   - Set `.env` in backend folder via cPanel
   - Update `.env` with production credentials
   - Restart Node app

5. **SSL/TLS**
   - Enable AutoSSL in cPanel
   - Ensure both domain and api.domain have certificates
   - Update FRONTEND_URL to `https://yourdomain.com`

---

## 📊 PERFORMANCE OPTIMIZATION TIPS

### Frontend
- Source maps disabled ✅
- Code splitting via React.lazy()
- Image optimization
- Bundle analysis: `npm run build`

### Backend
- Database indexes added ✅
- Pagination implemented ✅
- Lean queries for read operations ✅
- Connection pooling (default in Mongoose)
- Response caching (implement Redis if needed)

### Monitoring
```bash
# Monitor MongoDB performance
db.setProfilingLevel(1, { slowms: 100 })  # Log queries > 100ms

# Monitor Node.js
npm install -g clinic
clinic doctor -- node server.js
```

---

## 🔄 MAINTENANCE & UPDATES

### Regular Tasks
```bash
# Weekly
npm audit              # Check for vulnerabilities
npm update            # Update minor/patch versions

# Monthly
git log --oneline     # Review changes
db backup              # Database backup

# Quarterly
Security audit        # Run security tests
Load testing          # Performance verification
Dependency updates    # Update major versions if safe
```

### Security Patch Process
1. Test patch in development
2. Run full test suite
3. Deploy to staging
4. Verify functionality
5. Deploy to production
6. Monitor for issues

---

## 📞 TROUBLESHOOTING

### Issue: "MongoDB connection failed"
**Solution:**
- Check `MONGODB_URI` format in `.env`
- Verify network access in MongoDB Atlas
- Check IP whitelist settings
- Ensure username/password are correct

### Issue: "Authorization header is missing"
**Solution:**
- Token must be in sessionStorage (not localStorage)
- Header format: `Authorization: Bearer <token>`
- Frontend API interceptor automatically adds it

### Issue: "Admin login rate limited"
**Solution:**
- Wait 15 minutes for rate limit window to reset
- Reset is per IP address
- Check rate limiting in `server.js` line 81

### Issue: "Password validation failing"
**Solution:**
Password must include:
- Minimum 8 characters
- At least one UPPERCASE letter
- At least one lowercase letter
- At least one NUMBER (0-9)
- At least one SPECIAL character (!@#$%^&* etc.)

Example valid: `SecurePass123!`

### Issue: "CORS error in browser"
**Solution:**
- Check `FRONTEND_URL` in backend `.env`
- Ensure it matches frontend domain exactly
- No trailing slashes
- Include protocol: `https://domain.com`

---

## ✅ PRE-PRODUCTION CHECKLIST

- [ ] All secrets generated and stored securely (`.env` not in git)
- [ ] MongoDB backup configured
- [ ] SSL/TLS certificates installed
- [ ] HTTPS redirect configured
- [ ] Admin password changed from default
- [ ] All tests passing
- [ ] Load testing completed
- [ ] Error tracking configured (Sentry/LogRocket)
- [ ] Monitoring/alerting configured
- [ ] Backup recovery tested
- [ ] Disaster recovery plan documented
- [ ] Admin onboarding completed
- [ ] User documentation prepared
- [ ] Support contact information configured

---

## 📈 MONITORING DASHBOARD SETUP

Recommended tools:
1. **Error Tracking:** Sentry (`@sentry/node`, `@sentry/react`)
2. **Monitoring:** Datadog or New Relic
3. **Logging:** ELK Stack or Logz.io
4. **Uptime:** Uptime Robot or StatusPage

Example Sentry setup:
```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://your-sentry-dsn",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// In Express error handler:
Sentry.captureException(error);
```

---

## 🎓 SECURITY BEST PRACTICES IMPLEMENTED

✅ **Authentication & Authorization**
- JWT with expiration
- Strong password policy
- Rate limiting on auth endpoints
- Secure token storage (sessionStorage)

✅ **Data Protection**
- Bcrypt password hashing (salt: 10)
- Input validation and sanitization
- NoSQL injection prevention
- Atomic database operations

✅ **Network Security**
- HTTPS/TLS encryption (required)
- CORS restrictions
- Security headers (CSP, HSTS, X-Frame-Options)
- Rate limiting

✅ **Application Security**
- Helmet.js security headers
- Admin role enforcement
- Transaction logging
- Error message sanitization

---

## 📚 ADDITIONAL RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

---

**Last Updated:** 2026-08-13  
**Version:** 1.0  
**Status:** ✅ PRODUCTION READY (after environment configuration)
