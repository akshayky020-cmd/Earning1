import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_admin_key_for_jwt";
const DB_PATH = path.join(process.cwd(), "app.db");

function createDatabase(): Database.Database {
  try {
    return new Database(DB_PATH); 
  } catch (error: any) {
    if (error?.code === "SQLITE_CORRUPT" || /database disk image is malformed/i.test(error?.message || "")) {
      const backupPath = `${DB_PATH}.corrupt-${Date.now()}`;
      if (fs.existsSync(DB_PATH)) {
        fs.renameSync(DB_PATH, backupPath);
      }
      return new Database(DB_PATH);
    }
    throw error;
  }
}

async function startServer() {
  const app = express();
  const PORT = 5001;

  app.use(cors());
  app.use(express.json());

  // Initialize SQLite database
  const db = createDatabase();

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    );
    
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      walletBalance REAL DEFAULT 0,
      coins INTEGER DEFAULT 0,
      todayEarnings INTEGER DEFAULT 0,
      totalAdsWatched INTEGER DEFAULT 0,
      lastAdDate TEXT
    );

    
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      upiId TEXT,
      accountName TEXT,
      accountNo TEXT,
      ifsc TEXT,
      qrCodeUrl TEXT,
      paymentInstructions TEXT
    );
    CREATE TABLE IF NOT EXISTS ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      network TEXT,
      unitId TEXT,
      title TEXT,
      rewardCoins INTEGER,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS ad_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT,
      adId INTEGER,
      adName TEXT,
      coinsEarned INTEGER,
      date TEXT
    );
  `);

  // Seed default admin if none exists
  const adminCount = db.prepare("SELECT COUNT(*) as count FROM admins").get() as any;
  if (adminCount.count === 0) {
    const defaultEmail = "akshayky020@gmail.com";
    const defaultPassword = "adminpassword123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    db.prepare("INSERT INTO admins (email, password) VALUES (?, ?)").run(defaultEmail, hashedPassword);
    console.log(`Seeded default admin: ${defaultEmail} / ${defaultPassword}`);
  }

  // --- API Routes ---

  // --- Settings API Routes ---
  app.get("/api/settings", (req, res) => {
    try {
      let settings = db.prepare("SELECT * FROM settings ORDER BY id DESC LIMIT 1").get();
      if (!settings) {
        db.prepare("INSERT INTO settings (upiId) VALUES ('')").run();
        settings = db.prepare("SELECT * FROM settings ORDER BY id DESC LIMIT 1").get();
      }
      res.json(settings);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings", (req, res) => {
    try {
      const { upiId, accountName, accountNo, ifsc, qrCodeUrl, paymentInstructions } = req.body;
      const count = (db.prepare("SELECT COUNT(*) as count FROM settings").get() as any).count;
      
      if (count === 0) {
        db.prepare("INSERT INTO settings (upiId, accountName, accountNo, ifsc, qrCodeUrl, paymentInstructions) VALUES (?, ?, ?, ?, ?, ?)").run(
          upiId, accountName, accountNo, ifsc, qrCodeUrl, paymentInstructions
        );
      } else {
        db.prepare("UPDATE settings SET upiId = ?, accountName = ?, accountNo = ?, ifsc = ?, qrCodeUrl = ?, paymentInstructions = ?").run(
          upiId, accountName, accountNo, ifsc, qrCodeUrl, paymentInstructions
        );
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });


  // --- Ad Management API Routes (Admin) ---
  app.get("/api/admin/ads", (req, res) => {
    try {
      const ads = db.prepare("SELECT * FROM ads").all();
      res.json(ads);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch ads" });
    }
  });

  app.post("/api/admin/ads", (req, res) => {
    try {
      const { network, unitId, title, rewardCoins, status } = req.body;
      const result = db.prepare("INSERT INTO ads (network, unitId, title, rewardCoins, status) VALUES (?, ?, ?, ?, ?)").run(network, unitId, title, rewardCoins, status || 'active');
      res.json({ id: result.lastInsertRowid, ...req.body });
    } catch (err) {
      res.status(500).json({ error: "Failed to create ad" });
    }
  });

  app.put("/api/admin/ads/:id", (req, res) => {
    try {
      const { network, unitId, title, rewardCoins, status } = req.body;
      db.prepare("UPDATE ads SET network = ?, unitId = ?, title = ?, rewardCoins = ?, status = ? WHERE id = ?").run(network, unitId, title, rewardCoins, status, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update ad" });
    }
  });

  app.delete("/api/admin/ads/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM ads WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete ad" });
    }
  });

  app.get("/api/admin/ads/stats", (req, res) => {
    try {
      const totalAds = (db.prepare("SELECT COUNT(*) as count FROM ads").get() as any).count;
      const activeAds = (db.prepare("SELECT COUNT(*) as count FROM ads WHERE status = 'active'").get() as any).count;
      const totalEarnings = (db.prepare("SELECT SUM(coinsEarned) as total FROM ad_history").get() as any).total || 0;
      res.json({ totalAds, activeAds, totalEarnings });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // --- Watch & Earn API Routes (User) ---
  app.get("/api/user/ads", (req, res) => {
    try {
      const ads = db.prepare("SELECT * FROM ads WHERE status = 'active'").all();
      res.json(ads);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch ads" });
    }
  });

  app.get("/api/user/wallet/:userId", (req, res) => {
    try {
      const { userId } = req.params;
      let user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      if (!user) {
        db.prepare("INSERT INTO users (id) VALUES (?)").run(userId);
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      }
      
      // Reset daily limits if new day
      const today = new Date().toISOString().split('T')[0];
      if (user.lastAdDate !== today) {
         db.prepare("UPDATE users SET todayEarnings = 0, lastAdDate = ? WHERE id = ?").run(today, userId);
         user.todayEarnings = 0;
         user.lastAdDate = today;
      }
      
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  });

  app.get("/api/user/ad_history/:userId", (req, res) => {
    try {
      const history = db.prepare("SELECT * FROM ad_history WHERE userId = ? ORDER BY id DESC LIMIT 50").all(req.params.userId);
      res.json(history);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch ad history" });
    }
  });

  app.post("/api/user/ads/watch", (req, res) => {
    try {
      const { userId, adId } = req.body;
      const ad = db.prepare("SELECT * FROM ads WHERE id = ? AND status = 'active'").get(adId) as any;
      if (!ad) {
        return res.status(400).json({ error: "Invalid or inactive ad" });
      }

      const today = new Date().toISOString().split('T')[0];
      const timeNow = new Date().toISOString();
      
      let user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      if (!user) {
        db.prepare("INSERT INTO users (id) VALUES (?)").run(userId);
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      }

      // 100 coins = 1 Rs. Conversion happens in frontend request or automatically.
      // Let's add coins.
      const newCoins = user.coins + ad.rewardCoins;
      const newTodayEarnings = (user.lastAdDate === today ? user.todayEarnings : 0) + ad.rewardCoins;
      const newTotalWatched = user.totalAdsWatched + 1;

      db.prepare("UPDATE users SET coins = ?, todayEarnings = ?, totalAdsWatched = ?, lastAdDate = ? WHERE id = ?").run(
        newCoins, newTodayEarnings, newTotalWatched, today, userId
      );

      db.prepare("INSERT INTO ad_history (userId, adId, adName, coinsEarned, date) VALUES (?, ?, ?, ?, ?)").run(
        userId, ad.id, ad.title, ad.rewardCoins, timeNow
      );

      res.json({ success: true, coins: newCoins });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to complete ad watch" });
    }
  });

  app.post("/api/user/wallet/convert", (req, res) => {
    try {
      const { userId, coinsToConvert } = req.body;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      if (!user || user.coins < coinsToConvert) {
        return res.status(400).json({ error: "Insufficient coins" });
      }
      
      // 100 coins = 1 INR
      const inrAmount = coinsToConvert / 100;
      const newCoins = user.coins - coinsToConvert;
      const newBalance = user.walletBalance + inrAmount;

      db.prepare("UPDATE users SET coins = ?, walletBalance = ? WHERE id = ?").run(newCoins, newBalance, userId);
      
      res.json({ success: true, walletBalance: newBalance, coins: newCoins });
    } catch (err) {
      res.status(500).json({ error: "Failed to convert coins" });
    }
  });


  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: { message: "Email and password are required" } });
      }

      const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(email) as any;
      if (!admin) {
        return res.status(401).json({ error: { message: "Invalid credentials" } });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ error: { message: "Invalid credentials" } });
      }

      const token = jwt.sign({ id: admin.id, role: "admin", email: admin.email }, JWT_SECRET, { expiresIn: "1d" });
      
      res.json({
        user: {
          _id: admin.id,
          name: "Admin",
          email: admin.email,
          role: "admin",
          accessToken: token,
          walletBalance: 0
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: { message: "Internal server error" } });
    }
  });

  app.get("/api/admin/verify", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ user: decoded });
    } catch (err) {
      res.status(401).json({ error: { message: "Invalid token" } });
    }
  });

  // --- Vite Middleware for Development ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
