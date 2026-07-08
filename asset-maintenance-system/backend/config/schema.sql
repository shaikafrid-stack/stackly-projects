-- =====================================================================
-- Asset Maintenance & Service Request Management System
-- MySQL Schema
-- =====================================================================

CREATE DATABASE IF NOT EXISTS asset_maintenance_db;
USE asset_maintenance_db;

-- ---------------------------------------------------------------------
-- 1. users
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'maintenance_engineer', 'employee') NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 2. assets
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_name VARCHAR(150) NOT NULL,
  asset_code VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  purchase_date DATE,
  warranty_expiry DATE,
  status ENUM('active', 'in_maintenance', 'retired') NOT NULL DEFAULT 'active',
  assigned_to INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_assets_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- 3. service_requests
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  asset_id INT NOT NULL,
  issue_title VARCHAR(200) NOT NULL,
  issue_description TEXT,
  priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  status ENUM('Open', 'Assigned', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
  assigned_engineer_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sr_employee FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_sr_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  CONSTRAINT fk_sr_engineer FOREIGN KEY (assigned_engineer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- 4. maintenance_logs
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  engineer_id INT NOT NULL,
  maintenance_notes TEXT,
  resolution_summary TEXT,
  resolved_at TIMESTAMP NULL,
  CONSTRAINT fk_ml_request FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_ml_engineer FOREIGN KEY (engineer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 5. asset_history
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS asset_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  action_description TEXT,
  performed_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ah_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  CONSTRAINT fk_ah_user FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- Helpful indexes
-- ---------------------------------------------------------------------
CREATE INDEX idx_sr_status ON service_requests(status);
CREATE INDEX idx_sr_priority ON service_requests(priority);
CREATE INDEX idx_sr_engineer ON service_requests(assigned_engineer_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_category ON assets(category);
