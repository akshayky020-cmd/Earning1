# Environment Setup Guide

Follow these instructions to set up the Earning Website + Admin Panel on your local machine for development and testing.

## Prerequisites

Make sure you have the following installed on your system:
- **Node.js** (v16.x or strictly higher; LTS recommended)
- **MongoDB** (Local instance running on `localhost:27017` or a MongoDB Atlas URI)
- **Git** (optional, for version control)

## 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

3. Ensure MongoDB is running locally. If you are using MongoDB Atlas, update the `MONGO_URI` in the `backend/.env` file.

4. **Seed the Admin User**: Run the seed script to create the initial admin account (`admin@earning.com` / `admin123`). This will also verify your database connection.
   ```bash
   node seedAdmin.js
   ```

5. Start the backend development server:
   ```bash
   npm start
   ```
   The backend should now be running on `http://localhost:5000`.

## 2. Frontend Setup

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install the React frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be accessible at `http://localhost:5173`.

## Environment Variables (.env)
The backend `.env` file should look like this (created automatically during setup):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/earning_platform
JWT_SECRET=supersecretjwtkey_12345
RAZORPAY_KEY_ID=mock_rzp_test_key_123
RAZORPAY_KEY_SECRET=mock_rzp_test_secret_456
FRONTEND_URL=http://localhost:5173
```

## Admin Access
- URL: `http://localhost:5173/admin/login`
- Email: `admin@earning.com`
- Password: `admin123`
