-- Dataset Upload, Validation & Processing Module
-- Database schema (MySQL 8+)

CREATE DATABASE IF NOT EXISTS dataset_module CHARACTER SET utf8mb4;
USE dataset_module;

-- ============================
-- users
-- ============================
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  role          ENUM('ADMIN', 'ANALYST') NOT NULL DEFAULT 'ANALYST',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================
-- datasets
-- ============================
CREATE TABLE datasets (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  name               VARCHAR(200) NOT NULL,
  description         TEXT,
  category           VARCHAR(100),
  tags               VARCHAR(255),
  file_name          VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  file_type          ENUM('CSV', 'XLSX') NOT NULL,
  file_size          BIGINT NOT NULL,
  storage_path       VARCHAR(500) NOT NULL,
  uploaded_by        INT NOT NULL,
  row_count          INT DEFAULT 0,
  column_count       INT DEFAULT 0,
  status             ENUM('UPLOADED','VALIDATING','VALIDATION_FAILED','VALIDATED','PROCESSING','PROCESSED','FAILED') NOT NULL DEFAULT 'UPLOADED',
  uploaded_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at       DATETIME NULL,
  CONSTRAINT fk_dataset_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_dataset_name_user (name, uploaded_by),
  INDEX idx_dataset_status (status),
  INDEX idx_dataset_uploaded_by (uploaded_by)
) ENGINE=InnoDB;

-- ============================
-- dataset_columns
-- ============================
CREATE TABLE dataset_columns (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  dataset_id    INT NOT NULL,
  column_name   VARCHAR(200) NOT NULL,
  data_type     ENUM('STRING','INTEGER','DECIMAL','BOOLEAN','DATE') NOT NULL DEFAULT 'STRING',
  nullable      BOOLEAN NOT NULL DEFAULT TRUE,
  column_order  INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_column_dataset FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
  INDEX idx_column_dataset (dataset_id)
) ENGINE=InnoDB;

-- ============================
-- validation_results
-- ============================
CREATE TABLE validation_results (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  dataset_id         INT NOT NULL,
  total_records      INT NOT NULL DEFAULT 0,
  valid_records       INT NOT NULL DEFAULT 0,
  invalid_records     INT NOT NULL DEFAULT 0,
  missing_values      INT NOT NULL DEFAULT 0,
  duplicate_records   INT NOT NULL DEFAULT 0,
  validation_status   ENUM('PASSED','FAILED') NOT NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_validation_dataset FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
  INDEX idx_validation_dataset (dataset_id)
) ENGINE=InnoDB;

-- ============================
-- validation_errors
-- ============================
CREATE TABLE validation_errors (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  validation_id   INT NOT NULL,
  row_number      INT NOT NULL,
  column_name     VARCHAR(200),
  invalid_value   VARCHAR(500),
  error_message   VARCHAR(500) NOT NULL,
  CONSTRAINT fk_error_validation FOREIGN KEY (validation_id) REFERENCES validation_results(id) ON DELETE CASCADE,
  INDEX idx_error_validation (validation_id)
) ENGINE=InnoDB;

-- Seed test users (password = "Password123!" hashed with bcrypt, see README for plain-text test creds)
-- Passwords below are bcrypt hashes generated at setup time; see backend/src/utils/seed.js
