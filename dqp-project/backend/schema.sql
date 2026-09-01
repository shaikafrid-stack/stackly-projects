-- Dataset Profiling & Data Quality Analysis Module
-- MySQL schema (also auto-created by Sequelize sync() on server start)

CREATE DATABASE IF NOT EXISTS dqp_db;
USE dqp_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMINISTRATOR','DATA_ANALYST','DATA_STEWARD') NOT NULL DEFAULT 'DATA_ANALYST',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS datasets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(20) NOT NULL DEFAULT 'CSV',
  row_count INT DEFAULT 0,
  column_count INT DEFAULT 0,
  status ENUM('UPLOADED','PROCESSING','PROCESSED','FAILED') DEFAULT 'PROCESSED',
  profile_status ENUM('NOT_STARTED','IN_PROGRESS','COMPLETED','FAILED') DEFAULT 'NOT_STARTED',
  quality_score FLOAT NULL,
  last_profiled_at DATETIME NULL,
  uploaded_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_datasets_status (status),
  INDEX idx_datasets_name (name),
  CONSTRAINT fk_datasets_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS dataset_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dataset_id INT NOT NULL,
  total_rows INT DEFAULT 0,
  total_columns INT DEFAULT 0,
  total_cells INT DEFAULT 0,
  missing_values INT DEFAULT 0,
  duplicate_rows INT DEFAULT 0,
  valid_values INT DEFAULT 0,
  invalid_values INT DEFAULT 0,
  quality_score FLOAT DEFAULT 0,
  completeness_score FLOAT DEFAULT 0,
  validity_score FLOAT DEFAULT 0,
  uniqueness_score FLOAT DEFAULT 0,
  consistency_score FLOAT DEFAULT 0,
  profiled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_profiles_dataset (dataset_id),
  CONSTRAINT fk_profiles_dataset FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS column_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id INT NOT NULL,
  dataset_id INT NOT NULL,
  column_name VARCHAR(160) NOT NULL,
  data_type VARCHAR(30) NOT NULL,
  total_values INT DEFAULT 0,
  non_null_values INT DEFAULT 0,
  null_values INT DEFAULT 0,
  null_percentage FLOAT DEFAULT 0,
  unique_values INT DEFAULT 0,
  unique_percentage FLOAT DEFAULT 0,
  duplicate_values INT DEFAULT 0,
  invalid_values INT DEFAULT 0,
  min_value VARCHAR(100) NULL,
  max_value VARCHAR(100) NULL,
  avg_value FLOAT NULL,
  quality_score FLOAT DEFAULT 0,
  quality_status VARCHAR(20) DEFAULT 'GOOD',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_columns_profile (profile_id),
  INDEX idx_columns_dataset (dataset_id),
  INDEX idx_columns_quality (quality_score),
  CONSTRAINT fk_columns_profile FOREIGN KEY (profile_id) REFERENCES dataset_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_columns_dataset FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quality_issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dataset_id INT NOT NULL,
  column_name VARCHAR(160) NULL,
  issue_type VARCHAR(60) NOT NULL,
  affected_records INT DEFAULT 0,
  percentage FLOAT DEFAULT 0,
  severity ENUM('LOW','WARNING','HIGH') DEFAULT 'WARNING',
  description VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_issues_dataset (dataset_id),
  INDEX idx_issues_severity (severity),
  CONSTRAINT fk_issues_dataset FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quality_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rule_name VARCHAR(160) NOT NULL,
  rule_type ENUM('COMPLETENESS','UNIQUENESS','VALIDITY','CONSISTENCY') NOT NULL,
  threshold FLOAT NOT NULL DEFAULT 90,
  severity ENUM('LOW','WARNING','HIGH') DEFAULT 'WARNING',
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_rules_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
