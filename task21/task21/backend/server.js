require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const { initSchema } = require("./config/db");

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
initSchema();

// Auto-seed on first run so the app is usable immediately.
try {
  const { db } = require("./config/db");
  const userCount = db.prepare("SELECT COUNT(*) c FROM users").get().c;
  if (userCount === 0) {
    require("./db/seed");
  }
} catch (e) {
  console.error("Seed check failed:", e.message);
}

const authRoutes = require("./routes/auth");
const dataSourceRoutes = require("./routes/dataSources");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is healthy", timestamp: new Date().toISOString() });
});

app.use("/api", authRoutes);
app.use("/api/data-sources", dataSourceRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 handler
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found." });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Data Source Manager API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
