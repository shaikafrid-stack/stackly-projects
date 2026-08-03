const express = require("express");
const { db } = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

function buildSummary() {
  const total = db.prepare("SELECT COUNT(*) c FROM data_sources").get().c;
  const active = db.prepare("SELECT COUNT(*) c FROM data_sources WHERE status='Active'").get().c;
  const inactive = db.prepare("SELECT COUNT(*) c FROM data_sources WHERE status='Inactive'").get().c;
  const successTests = db.prepare("SELECT COUNT(*) c FROM connection_history WHERE connection_status='Success'").get().c;
  const failedTests = db.prepare("SELECT COUNT(*) c FROM connection_history WHERE connection_status='Failed'").get().c;

  const byType = db.prepare(`
    SELECT database_type AS name, COUNT(*) AS value
    FROM data_sources GROUP BY database_type ORDER BY value DESC
  `).all();

  const activeVsInactive = [
    { name: "Active", value: active },
    { name: "Inactive", value: inactive },
  ];

  const monthlyHistory = db.prepare(`
    SELECT strftime('%Y-%m', test_time) AS month,
           SUM(CASE WHEN connection_status='Success' THEN 1 ELSE 0 END) AS success,
           SUM(CASE WHEN connection_status='Failed' THEN 1 ELSE 0 END) AS failed
    FROM connection_history
    GROUP BY month
    ORDER BY month ASC
  `).all();

  const byEnvironment = db.prepare(`
    SELECT environment AS name, COUNT(*) AS value FROM data_sources GROUP BY environment
  `).all();

  const recentActivity = db.prepare(`
    SELECT ch.id, ch.test_time, ch.connection_status, ch.remarks,
           ds.connection_name, u.name AS tested_by_name
    FROM connection_history ch
    JOIN data_sources ds ON ds.id = ch.datasource_id
    LEFT JOIN users u ON u.id = ch.tested_by
    ORDER BY ch.test_time DESC
    LIMIT 10
  `).all();

  return {
    cards: {
      totalDataSources: total,
      activeConnections: active,
      inactiveConnections: inactive,
      successfulTests: successTests,
      failedTests: failedTests,
    },
    charts: {
      byDatabaseType: byType,
      activeVsInactive,
      monthlyHistory,
      byEnvironment,
    },
    recentActivity,
  };
}

// GET /api/dashboard/admin  (ADMIN only — full analytics)
router.get("/admin", authorize("ADMIN"), (req, res) => {
  res.json({ success: true, data: buildSummary() });
});

// GET /api/dashboard/analyst  (ANALYST — read-only summary, no CRUD data)
router.get("/analyst", authorize("ANALYST", "ADMIN"), (req, res) => {
  const summary = buildSummary();
  // Analysts get the same visibility into read-only stats, but the endpoint
  // is kept separate to allow independent access-control evolution per role.
  res.json({ success: true, data: summary });
});

module.exports = router;
