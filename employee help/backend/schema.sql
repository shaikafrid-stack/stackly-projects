-- Employee Helpdesk & Knowledge Base Management System
-- MySQL Schema

CREATE DATABASE IF NOT EXISTS helpdesk_db;
USE helpdesk_db;

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'support_engineer', 'employee') NOT NULL DEFAULT 'employee',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- TICKET CATEGORIES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- TICKETS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  assigned_engineer_id INT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Low',
  status ENUM('Open', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
  attachment_name VARCHAR(255) NULL,
  resolution_notes TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_engineer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────
-- TICKET COMMENTS (also used as status-history log)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  status_at_comment VARCHAR(50) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- KNOWLEDGE BASE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS knowledge_base (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- Helpful indexes
-- ─────────────────────────────────────────
CREATE INDEX idx_tickets_employee ON tickets(employee_id);
CREATE INDEX idx_tickets_engineer ON tickets(assigned_engineer_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_kb_category ON knowledge_base(category);

-- ─────────────────────────────────────────
-- Seed: default categories
-- ─────────────────────────────────────────
INSERT INTO ticket_categories (category_name, description) VALUES
('Hardware', 'Issues related to laptops, desktops, peripherals'),
('Software', 'Application installs, bugs, licensing'),
('Network', 'VPN, WiFi, connectivity issues'),
('Access', 'Account access, permissions, password resets'),
('HR/Payroll', 'HR system and payroll related queries')
ON DUPLICATE KEY UPDATE category_name = category_name;

-- ─────────────────────────────────────────
-- Seed: test users
-- Password for all three accounts = "Password123"
-- Hash generated with bcryptjs (10 rounds)
-- NOTE: You can also run `npm run seed` in /backend which does this
-- programmatically instead of via raw SQL.
-- ─────────────────────────────────────────
INSERT INTO users (name, email, password, role) VALUES
('Alice Admin', 'admin@helpdesk.com', '$2a$10$tXONFdrvbsNE0/4P4MPs.eSzjkg0wL6lcJJahkRzfsyyHKyrRx7.q', 'admin'),
('Sam Support', 'support@helpdesk.com', '$2a$10$tXONFdrvbsNE0/4P4MPs.eSzjkg0wL6lcJJahkRzfsyyHKyrRx7.q', 'support_engineer'),
('Eddie Employee', 'employee@helpdesk.com', '$2a$10$tXONFdrvbsNE0/4P4MPs.eSzjkg0wL6lcJJahkRzfsyyHKyrRx7.q', 'employee')
ON DUPLICATE KEY UPDATE email = email;
