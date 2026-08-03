const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { db, initSchema } = require("../config/db");

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

initSchema();

const userCount = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;

if (userCount === 0) {
  console.log("Seeding database...");

  const insertUser = db.prepare(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
  );

  const users = [
    ["Admin User", "admin@datasource.io", "Admin@123", "ADMIN"],
    ["Priya Analyst", "analyst@datasource.io", "Analyst@123", "ANALYST"],
  ];

  const userIds = {};
  for (const [name, email, password, role] of users) {
    const hash = bcrypt.hashSync(password, 10);
    const info = insertUser.run(name, email, hash, role);
    userIds[role] = info.lastInsertRowid;
  }

  const insertDS = db.prepare(`
    INSERT INTO data_sources
      (connection_name, database_type, host, port, database_name, username, password,
       environment, category, status, last_tested_at, last_result, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Date.now();
  const daysAgo = (n) => new Date(now - n * 86400000).toISOString();

  const sources = [
    ["Core Banking MySQL", "MySQL", "prod-mysql-01.internal", 3306, "core_banking", "svc_core", "P@ssw0rd1", "Production", "Finance", "Active", daysAgo(1), "Success"],
    ["Customer Analytics PG", "PostgreSQL", "analytics-pg.internal", 5432, "customer_analytics", "svc_analytics", "AnalyzeMe2024", "Production", "Analytics", "Active", daysAgo(2), "Success"],
    ["Legacy Oracle ERP", "Oracle", "erp-oracle-legacy.internal", 1521, "ERP_PROD", "erp_svc", "0raclePwd!", "Production", "ERP", "Active", daysAgo(10), "Failed"],
    ["QA SQL Server", "SQL Server", "qa-sqlserver.internal", 1433, "qa_testing", "qa_user", "QaTest#456", "Testing", "QA", "Active", daysAgo(3), "Success"],
    ["Dev MongoDB Cluster", "MongoDB", "dev-mongo.internal", 27017, "dev_app", "dev_user", "DevMongo!1", "Development", "Application", "Active", daysAgo(5), "Success"],
    ["Marketing Snowflake WH", "Snowflake", "xy12345.snowflakecomputing.com", 443, "MARKETING_DB", "mkt_svc", "SnowFlake#9", "Production", "Marketing", "Active", daysAgo(1), "Success"],
    ["Data Lake Redshift", "Redshift", "datalake.redshift.amazonaws.com", 5439, "data_lake", "redshift_admin", "RedShift@8", "Production", "Analytics", "Inactive", daysAgo(20), "Failed"],
    ["BigQuery Reporting", "BigQuery", "bigquery.googleapis.com", 443, "reporting_ds", "bq_svc_account", "BigQ#2024", "Production", "Reporting", "Active", daysAgo(4), "Success"],
    ["Staging MySQL Replica", "MySQL", "staging-mysql.internal", 3306, "staging_replica", "stg_user", "Staging!23", "Testing", "Finance", "Active", daysAgo(6), "Success"],
    ["Archive PostgreSQL", "PostgreSQL", "archive-pg.internal", 5432, "archive_2023", "archive_svc", "Archive#77", "Development", "Archive", "Inactive", daysAgo(45), "Failed"],
    ["HR Oracle System", "Oracle", "hr-oracle.internal", 1521, "HR_PROD", "hr_svc", "HrOracle$5", "Production", "HR", "Active", daysAgo(2), "Success"],
    ["Sandbox SQL Server", "SQL Server", "sandbox-sql.internal", 1433, "sandbox_db", "sandbox_user", "Sandbox@1", "Development", "Application", "Active", null, "Not Tested"],
  ];

  const dsIds = [];
  for (const s of sources) {
    const [connection_name, database_type, host, port, database_name, username, password,
      environment, category, status, last_tested_at, last_result] = s;
    const info = insertDS.run(
      connection_name, database_type, host, port, database_name, username, password,
      environment, category, status, last_tested_at, last_result, userIds.ADMIN,
      last_tested_at || daysAgo(30)
    );
    dsIds.push(info.lastInsertRowid);
  }

  const insertHistory = db.prepare(`
    INSERT INTO connection_history (datasource_id, tested_by, test_time, connection_status, remarks)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Generate a spread of history entries over the last ~6 months for charting
  const remarksSuccess = [
    "Connection established successfully.",
    "Ping and authentication succeeded.",
    "Handshake completed within expected latency.",
  ];
  const remarksFail = [
    "Connection timed out after 30s.",
    "Authentication failed: invalid credentials.",
    "Host unreachable.",
  ];

  dsIds.forEach((id, idx) => {
    const entries = 4 + (idx % 5); // vary count per source
    for (let i = 0; i < entries; i++) {
      const dayOffset = Math.floor(Math.random() * 180);
      const success = Math.random() > 0.25;
      insertHistory.run(
        id,
        Math.random() > 0.5 ? userIds.ADMIN : userIds.ANALYST,
        daysAgo(dayOffset),
        success ? "Success" : "Failed",
        success
          ? remarksSuccess[Math.floor(Math.random() * remarksSuccess.length)]
          : remarksFail[Math.floor(Math.random() * remarksFail.length)]
      );
    }
  });

  console.log("Seed complete.");
  console.log("  Admin login:   admin@datasource.io / Admin@123");
  console.log("  Analyst login: analyst@datasource.io / Analyst@123");
} else {
  console.log("Database already seeded, skipping.");
}
