import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

import transactionsRoute from "./routes/transactionsRoute.js";
import analyticsRoute from "./routes/analyticsRoute.js";
import job from "./config/cron.js";

dotenv.config();

const app = express();

if (process.env.NODE_ENV === "production") job.start();

// middleware
app.use(cors());
app.use(rateLimiter);
app.use(express.json());

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const PORT = process.env.PORT || 5003;

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/transactions", transactionsRoute);
app.use("/api/analytics", analyticsRoute);

initDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log("========================================");
      console.log("Server is up and running!");
      console.log(`PORT: ${PORT}`);
      console.log(`Listening on: 0.0.0.0:${PORT}`);
      console.log("========================================");
      console.log("\nTo connect from mobile device:");
      console.log("1. Make sure your device is on the same network");
      console.log("2. Find your computer's IP address:");
      console.log("   - Windows: Run 'ipconfig' and look for IPv4 Address");
      console.log("   - Mac/Linux: Run 'ifconfig' or 'ip addr'");
      console.log(`3. Update mobile/constants/api.js with: http://YOUR_IP:${PORT}/api`);
      console.log("========================================\n");
    });
  })
  .catch((error) => {
    console.error("========================================");
    console.error("ERROR: Failed to initialize database");
    console.error("========================================");
    console.error("Make sure you have a .env file with DATABASE_URL set");
    console.error("Error details:", error.message);
    console.error("========================================\n");
    
    // Still start the server so health check works, but API endpoints will fail
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server started on port ${PORT} but database is not connected.`);
      console.log("API endpoints will not work until DATABASE_URL is configured.\n");
    });
  });
