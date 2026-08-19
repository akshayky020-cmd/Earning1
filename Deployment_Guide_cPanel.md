# Deployment Guide (VPS + cPanel)

This guide walks you through deploying the Earning Website + Admin Panel to a VPS using cPanel. We assume you have a domain name, a VPS, and WHM/cPanel installed.

## 1. Preparation

### Build the Frontend
1. On your local machine, navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Build the production application:
   ```bash
   npm run build
   ```
3. This creates a `dist` folder. Zip the contents of this `dist` folder (not the folder itself, but the files inside it). Name it `frontend.zip`.

### Prepare the Backend
1. Zip the entire `backend` directory. **Important:** Do NOT include the `node_modules` folder inside the zip to save time and space. Name the zip `backend.zip`.

---

## 2. Deploying the Backend (Node.js) on cPanel

1. **Log in to cPanel.**
2. **Database Setup:**
   - Go to **MySQL Databases**.
   - Create a new database (e.g., `user_earning_db`).
   - Create a new user, generate a password, and add the user to the database with **All Privileges**.
   - *Note your Database URI (e.g., `mongodb://user:password@localhost:27017/db_name` or if using cPanel's local MongoDB setup, ensure the connection string is correct).* If you use MongoDB Atlas, just keep your Atlas connection string ready.
3. **Setup Node.js App:**
   - In cPanel, go to **Setup Node.js App** (under Software).
   - Click **Create Application**.
   - **Node.js version**: Choose the recommended (e.g., 16.x or 18.x).
   - **Application mode**: `Production`
   - **Application root**: `backend` (this will create a folder outside your public_html).
   - **Application URL**: `api.yourdomain.com` (you need to create a subdomain for this beforehand).
   - **Application startup file**: `server.js`
   - Click **Create**.
4. **Upload Files:**
   - Go to **File Manager** -> navigate to the `backend` folder you just specified.
   - Upload `backend.zip` and extract it here.
   - Ensure `server.js`, `package.json`, etc., are in the root of this folder.
5. **Environment Variables:**
   - Create or edit the `.env` file in the `backend` folder.
   - Update `MONGO_URI` with your production database credentials.
   - Set `FRONTEND_URL` to `https://yourdomain.com`.
6. **Install Dependencies & Start:**
   - Go back to **Setup Node.js App**.
   - Scroll down to the app and click **Run NPM Install**.
   - Once complete, click **Restart** to ensure the Node app is running.

---

## 3. Deploying the Frontend (React) on cPanel

1. **Upload Frontend Files:**
   - In cPanel, go to **File Manager**.
   - Navigate to `public_html` (or the document root of your main domain).
   - Upload `frontend.zip`.
   - Extract the contents directly into `public_html`.
2. **Routing Fix for React:**
   - React uses client-side routing. To prevent 404 errors on page refresh, you need to create an `.htaccess` file.
   - Inside `public_html`, click **+ File** and name it `.htaccess`.
   - Add the following rewrite rules:
     ```apache
     <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
     </IfModule>
     ```
   - Save the file.

---

## 4. Final Security & SSL

1. Ensure SSL/TLS is enabled for both `yourdomain.com` and `api.yourdomain.com`. AutoSSL in cPanel normally handles this.
2. In your local frontend `.env` or configuration (if any), make sure to point backend API requests to `https://api.yourdomain.com` before you run `npm run build` in Step 1. (Currently set to localhost in code, so change `http://localhost:5000` to your actual live API URL in the frontend Axios calls).

Your application is now live!
