const express = require("express");
const { body, validationResult } = require("express-validator");
const { db } = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

const VALID_DB_TYPES = [
  "MySQL", "PostgreSQL", "Oracle", "SQL Server", "MongoDB", "Snowflake", "Redshift", "BigQuery",
];
const VALID_ENVIRONMENTS = ["Development", "Testing", "Production"];

function maskPassword(pw) {
  if (!pw) return "";
  return "•".repeat(Math.min(pw.length, 10));
}

function serialize(row) {
  return { ...row, password: maskPassword(row.password) };
}

// GET /api/data-sources  (search, filter, paginate — available to ADMIN & ANALYST)
router.get("/", (req, res) => {
  const {
    search = "",
    database_type,
    environment,
    status,
    category,
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortDir = "desc",
  } = req.query;

  const allowedSort = ["created_at", "connection_name", "database_type", "environment", "status", "last_tested_at"];
  const sortCol = allowedSort.includes(sortBy) ? sortBy : "created_at";
  const dir = sortDir.toLowerCase() === "asc" ? "ASC" : "DESC";

  let where = "WHERE 1=1";
  const params = [];

  if (search) {
    where += " AND (connection_name LIKE ? OR host LIKE ? OR database_name LIKE ? OR category LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  if (database_type) {
    where += " AND database_type = ?";
    params.push(database_type);
  }
  if (environment) {
    where += " AND environment = ?";
    params.push(environment);
  }
  if (status) {
    where += " AND status = ?";
    params.push(status);
  }
  if (category) {
    where += " AND category = ?";
    params.push(category);
  }

  const total = db.prepare(`SELECT COUNT(*) AS c FROM data_sources ${where}`).get(...params).c;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const offset = (pageNum - 1) * pageSize;

  const rows = db
    .prepare(`SELECT * FROM data_sources ${where} ORDER BY ${sortCol} ${dir} LIMIT ? OFFSET ?`)
    .all(...params, pageSize, offset);

  res.json({
    success: true,
    data: rows.map(serialize),
    pagination: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) || 1 },
  });
});

// GET /api/data-sources/meta/categories — distinct categories for grouping UI
// (declared before /:id so it isn't shadowed by the param route)
router.get("/meta/categories", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT category FROM data_sources ORDER BY category").all();
  res.json({ success: true, data: rows.map((r) => r.category) });
});

// GET /api/data-sources/:id
router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM data_sources WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ success: false, message: "Data source not found." });
  res.json({ success: true, data: serialize(row) });
});

const dataSourceValidators = [
  body("connection_name").trim().notEmpty().withMessage("Connection name is required."),
  body("database_type").isIn(VALID_DB_TYPES).withMessage("Invalid database type."),
  body("host").trim().notEmpty().withMessage("Host is required."),
  body("port").isInt({ min: 1, max: 65535 }).withMessage("Port must be a valid number (1-65535)."),
  body("database_name").trim().notEmpty().withMessage("Database name is required."),
  body("username").trim().notEmpty().withMessage("Username is required."),
  body("password").notEmpty().withMessage("Password is required."),
  body("environment").isIn(VALID_ENVIRONMENTS).withMessage("Invalid environment."),
];

// POST /api/data-sources  (ADMIN only)
router.post("/", authorize("ADMIN"), dataSourceValidators, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const {
    connection_name, database_type, host, port, database_name,
    username, password, environment, category = "General", status = "Active",
  } = req.body;

  const info = db.prepare(`
    INSERT INTO data_sources
      (connection_name, database_type, host, port, database_name, username, password,
       environment, category, status, last_result, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Not Tested', ?)
  `).run(connection_name, database_type, host, port, database_name, username, password,
         environment, category, status, req.user.id);

  const row = db.prepare("SELECT * FROM data_sources WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ success: true, message: "Data source created successfully.", data: serialize(row) });
});

// PUT /api/data-sources/:id  (ADMIN only)
router.put("/:id", authorize("ADMIN"), dataSourceValidators, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const existing = db.prepare("SELECT * FROM data_sources WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: "Data source not found." });

  const {
    connection_name, database_type, host, port, database_name,
    username, password, environment, category = existing.category, status = existing.status,
  } = req.body;

  db.prepare(`
    UPDATE data_sources SET
      connection_name = ?, database_type = ?, host = ?, port = ?, database_name = ?,
      username = ?, password = ?, environment = ?, category = ?, status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(connection_name, database_type, host, port, database_name, username, password,
         environment, category, status, req.params.id);

  const row = db.prepare("SELECT * FROM data_sources WHERE id = ?").get(req.params.id);
  res.json({ success: true, message: "Data source updated successfully.", data: serialize(row) });
});

// PATCH /api/data-sources/:id/status  (ADMIN only) — enable/disable
router.patch("/:id/status", authorize("ADMIN"), (req, res) => {
  const { status } = req.body;
  if (!["Active", "Inactive"].includes(status)) {
    return res.status(400).json({ success: false, message: "Status must be 'Active' or 'Inactive'." });
  }
  const existing = db.prepare("SELECT * FROM data_sources WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: "Data source not found." });

  db.prepare("UPDATE data_sources SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(status, req.params.id);

  const row = db.prepare("SELECT * FROM data_sources WHERE id = ?").get(req.params.id);
  res.json({ success: true, message: `Data source ${status.toLowerCase()}d.`, data: serialize(row) });
});

// DELETE /api/data-sources/:id  (ADMIN only)
router.delete("/:id", authorize("ADMIN"), (req, res) => {
  const existing = db.prepare("SELECT * FROM data_sources WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: "Data source not found." });

  db.prepare("DELETE FROM data_sources WHERE id = ?").run(req.params.id);
  res.json({ success: true, message: "Data source deleted successfully." });
});

// POST /api/data-sources/:id/test  (ADMIN only) — simulated connection test
router.post("/:id/test", authorize("ADMIN"), (req, res) => {
  const existing = db.prepare("SELECT * FROM data_sources WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: "Data source not found." });

  // --- Simulated connection test ---
  // Deterministic-ish weighted random outcome (no real network call is made).
  // Inactive sources are more likely to fail, mirroring a plausible real scenario.
  const failBias = existing.status === "Inactive" ? 0.6 : 0.15;
  const isSuccess = Math.random() >= failBias;

  const successRemarks = [
    "Connection established successfully.",
    "Ping and authentication succeeded.",
    "Handshake completed within expected latency.",
  ];
  const failRemarks = [
    "Connection timed out after 30s.",
    "Authentication failed: invalid credentials.",
    "Host unreachable.",
  ];
  const remarks = isSuccess
    ? successRemarks[Math.floor(Math.random() * successRemarks.length)]
    : failRemarks[Math.floor(Math.random() * failRemarks.length)];

  const now = new Date().toISOString();

  db.prepare(`
    UPDATE data_sources SET last_tested_at = ?, last_result = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(now, isSuccess ? "Success" : "Failed", req.params.id);

  db.prepare(`
    INSERT INTO connection_history (datasource_id, tested_by, test_time, connection_status, remarks)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.params.id, req.user.id, now, isSuccess ? "Success" : "Failed", remarks);

  const row = db.prepare("SELECT * FROM data_sources WHERE id = ?").get(req.params.id);

  res.json({
    success: true,
    message: `Simulated connection test ${isSuccess ? "succeeded" : "failed"}.`,
    result: isSuccess ? "Success" : "Failed",
    remarks,
    data: serialize(row),
  });
});

// GET /api/data-sources/:id/history
router.get("/:id/history", (req, res) => {
  const existing = db.prepare("SELECT id FROM data_sources WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: "Data source not found." });

  const rows = db.prepare(`
    SELECT ch.*, u.name AS tested_by_name
    FROM connection_history ch
    LEFT JOIN users u ON u.id = ch.tested_by
    WHERE ch.datasource_id = ?
    ORDER BY ch.test_time DESC
  `).all(req.params.id);

  res.json({ success: true, data: rows });
});

module.exports = router;
