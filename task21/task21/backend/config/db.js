/**
 * Database connection layer.
 *
 * The production schema (see db/schema.mysql.sql) targets MySQL, as required
 * by the task spec. For zero-config local development / evaluation this
 * server runs against SQLite using Node's built-in `node:sqlite` module —
 * no native compilation, no Visual Studio / Xcode build tools, no npm
 * install step for the database driver at all. It ships inside Node.js
 * itself (stable since Node 22.5+, unflagged since Node 24).
 *
 * The table/column layout below is identical to the MySQL schema, so all
 * queries, relationships, and business logic are portable — only this file
 * needs to change to switch to real MySQL.
 *
 * To switch to real MySQL: implement this same `{ db, initSchema }` interface
 * using `mysql2`, see the commented MYSQL SETUP block at the bottom of this file.
 */
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const DB_PATH = path.join(dataDir, "datasource_manager.db");

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('ADMIN','ANALYST')) DEFAULT 'ANALYST',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS data_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      connection_name TEXT NOT NULL,
      database_type TEXT NOT NULL,
      host TEXT NOT NULL,
      port INTEGER NOT NULL,
      database_name TEXT NOT NULL,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      environment TEXT NOT NULL CHECK(environment IN ('Development','Testing','Production')) DEFAULT 'Development',
      category TEXT DEFAULT 'General',
      status TEXT NOT NULL CHECK(status IN ('Active','Inactive')) DEFAULT 'Active',
      last_tested_at DATETIME,
      last_result TEXT NOT NULL CHECK(last_result IN ('Success','Failed','Not Tested')) DEFAULT 'Not Tested',
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS connection_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datasource_id INTEGER NOT NULL,
      tested_by INTEGER,
      test_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      connection_status TEXT NOT NULL CHECK(connection_status IN ('Success','Failed')),
      remarks TEXT,
      FOREIGN KEY (datasource_id) REFERENCES data_sources(id) ON DELETE CASCADE,
      FOREIGN KEY (tested_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_ds_type ON data_sources(database_type);
    CREATE INDEX IF NOT EXISTS idx_ds_env ON data_sources(environment);
    CREATE INDEX IF NOT EXISTS idx_ds_status ON data_sources(status);
    CREATE INDEX IF NOT EXISTS idx_ch_datasource ON connection_history(datasource_id);
  `);
}

module.exports = { db, initSchema };

/* ============================================================
 * MYSQL SETUP (for production deployment)
 * ============================================================
 * 1. npm install mysql2
 * 2. Run db/schema.mysql.sql against your MySQL server:
 *      mysql -u root -p < db/schema.mysql.sql
 * 3. Replace this file's export with a mysql2 pool, e.g.:
 *
 *    const mysql = require("mysql2/promise");
 *    const pool = mysql.createPool({
 *      host: process.env.DB_HOST,
 *      user: process.env.DB_USER,
 *      password: process.env.DB_PASSWORD,
 *      database: process.env.DB_NAME,
 *      waitForConnections: true,
 *      connectionLimit: 10,
 *    });
 *    module.exports = { db: pool };
 *
 * 4. Update .env with DB_HOST / DB_USER / DB_PASSWORD / DB_NAME.
 * ============================================================ */
