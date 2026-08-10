-- Task 23: Dataset & Metadata Management Module
-- Database Schema (MySQL)

CREATE DATABASE IF NOT EXISTS task23_dataset_mgmt;
USE task23_dataset_mgmt;

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Administrator', 'Data Steward', 'Data Analyst') NOT NULL DEFAULT 'Data Analyst',
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- WORKSPACES
-- =========================
CREATE TABLE IF NOT EXISTS workspaces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workspace_name VARCHAR(150) NOT NULL,
  description TEXT,
  steward_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (steward_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================
-- DATASETS
-- =========================
CREATE TABLE IF NOT EXISTS datasets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id INT NOT NULL,
  dataset_name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  owner_id INT NULL,
  data_source VARCHAR(255),
  version VARCHAR(20) DEFAULT 'v1.0',
  status ENUM('Draft', 'Published', 'Archived') NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================
-- DATASET TAGS
-- =========================
CREATE TABLE IF NOT EXISTS dataset_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dataset_id INT NOT NULL,
  tag_name VARCHAR(100) NOT NULL,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

-- =========================
-- DATASET ACTIVITY (audit log / version history)
-- =========================
CREATE TABLE IF NOT EXISTS dataset_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dataset_id INT NOT NULL,
  user_id INT NULL,
  activity VARCHAR(255) NOT NULL,
  version VARCHAR(20) NULL,
  activity_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================
-- FAVORITES (optional feature)
-- =========================
CREATE TABLE IF NOT EXISTS dataset_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dataset_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (dataset_id, user_id),
  FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for search/filter performance
CREATE INDEX idx_datasets_status ON datasets(status);
CREATE INDEX idx_datasets_category ON datasets(category);
CREATE INDEX idx_datasets_owner ON datasets(owner_id);
CREATE INDEX idx_datasets_workspace ON datasets(workspace_id);
CREATE INDEX idx_datasets_name ON datasets(dataset_name);
