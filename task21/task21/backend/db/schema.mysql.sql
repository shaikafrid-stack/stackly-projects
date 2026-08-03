-- ============================================================
-- Data Source Configuration & Connection Management Module
-- MySQL Production Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS datasource_manager
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE datasource_manager;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(160)  NOT NULL UNIQUE,
  password      VARCHAR(255)  NOT NULL,               -- bcrypt hash
  role          ENUM('ADMIN', 'ANALYST') NOT NULL DEFAULT 'ANALYST',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- data_sources
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_sources (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  connection_name VARCHAR(160) NOT NULL,
  database_type   ENUM('MySQL','PostgreSQL','Oracle','SQL Server','MongoDB','Snowflake','Redshift','BigQuery') NOT NULL,
  host            VARCHAR(255) NOT NULL,
  port            INT NOT NULL,
  database_name   VARCHAR(160) NOT NULL,
  username        VARCHAR(120) NOT NULL,
  password        VARCHAR(255) NOT NULL,               -- encrypted/masked at rest
  environment     ENUM('Development','Testing','Production') NOT NULL DEFAULT 'Development',
  category        VARCHAR(80)  DEFAULT 'General',       -- grouping/category
  status          ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  last_tested_at  DATETIME NULL,
  last_result     ENUM('Success','Failed','Not Tested') NOT NULL DEFAULT 'Not Tested',
  created_by      INT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ds_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_ds_type (database_type),
  INDEX idx_ds_env (environment),
  INDEX idx_ds_status (status),
  INDEX idx_ds_category (category)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- connection_history
-- One-to-Many: data_sources (1) -> connection_history (N)
-- Every test run against a data source creates an immutable
-- history record, preserving a full audit trail over time.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS connection_history (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  datasource_id     INT NOT NULL,
  tested_by         INT NULL,
  test_time         DATETIME DEFAULT CURRENT_TIMESTAMP,
  connection_status ENUM('Success','Failed') NOT NULL,
  remarks           VARCHAR(500),
  CONSTRAINT fk_ch_datasource FOREIGN KEY (datasource_id) REFERENCES data_sources(id) ON DELETE CASCADE,
  CONSTRAINT fk_ch_tested_by  FOREIGN KEY (tested_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_ch_datasource (datasource_id),
  INDEX idx_ch_test_time (test_time)
) ENGINE=InnoDB;
