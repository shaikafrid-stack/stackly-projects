-- ============================================
-- Workspace & Dashboard Management Module
-- MySQL Schema (import this in MySQL Workbench)
-- ============================================

DROP DATABASE IF EXISTS workspace_dashboard_db;
CREATE DATABASE workspace_dashboard_db;
USE workspace_dashboard_db;

-- ------------------------------------------------
-- users
-- ------------------------------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Administrator', 'Workspace Manager', 'Member') NOT NULL DEFAULT 'Member',
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------
-- workspaces
-- ------------------------------------------------
CREATE TABLE workspaces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workspace_name VARCHAR(150) NOT NULL,
  description TEXT,
  created_by INT NOT NULL,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_workspace_creator FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE CASCADE
);

-- ------------------------------------------------
-- workspace_members
-- ------------------------------------------------
CREATE TABLE workspace_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id INT NOT NULL,
  user_id INT NOT NULL,
  member_role ENUM('Workspace Manager', 'Member') NOT NULL DEFAULT 'Member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wm_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_wm_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  UNIQUE KEY unique_workspace_user (workspace_id, user_id)
);

-- ------------------------------------------------
-- dashboards
-- ------------------------------------------------
CREATE TABLE dashboards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id INT NOT NULL,
  dashboard_name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  description TEXT,
  status ENUM('Active', 'Archived') NOT NULL DEFAULT 'Active',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dashboard_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_dashboard_creator FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE CASCADE
);

-- ------------------------------------------------
-- activity_logs
-- ------------------------------------------------
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id INT,
  user_id INT NOT NULL,
  activity VARCHAR(255) NOT NULL,
  activity_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

-- Helpful indexes
CREATE INDEX idx_workspaces_status ON workspaces(status);
CREATE INDEX idx_dashboards_workspace ON dashboards(workspace_id);
CREATE INDEX idx_dashboards_category ON dashboards(category);
CREATE INDEX idx_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_members_user ON workspace_members(user_id);
CREATE INDEX idx_logs_workspace ON activity_logs(workspace_id);
