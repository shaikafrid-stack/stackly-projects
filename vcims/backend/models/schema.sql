-- Vendor Contract & Invoice Management System - MySQL Schema
CREATE DATABASE IF NOT EXISTS vcims_db;
USE vcims_db;

-- ========================================
-- USERS
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'finance_manager', 'vendor') NOT NULL DEFAULT 'vendor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- VENDORS
-- (linked 1:1 optionally to a users row with role='vendor')
-- ========================================
CREATE TABLE IF NOT EXISTS vendors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  vendor_name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(150),
  phone VARCHAR(30),
  email VARCHAR(150),
  address VARCHAR(255),
  status ENUM('active', 'inactive', 'blacklisted') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================================
-- CONTRACTS
-- ========================================
CREATE TABLE IF NOT EXISTS contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL,
  contract_title VARCHAR(200) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  contract_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  status ENUM('active', 'expired', 'terminated', 'draft') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- ========================================
-- INVOICES
-- ========================================
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL,
  contract_id INT NOT NULL,
  invoice_number VARCHAR(100) NOT NULL UNIQUE,
  invoice_amount DECIMAL(15,2) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payment_status ENUM('Unpaid', 'Partially Paid', 'Paid') NOT NULL DEFAULT 'Unpaid',
  approval_status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
  file_name VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

-- ========================================
-- INVOICE COMMENTS
-- ========================================
CREATE TABLE IF NOT EXISTS invoice_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================
-- PAYMENTS
-- ========================================
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  payment_amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_mode ENUM('Bank Transfer', 'Cheque', 'UPI', 'Card', 'Cash') NOT NULL DEFAULT 'Bank Transfer',
  transaction_reference VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_invoices_vendor ON invoices(vendor_id);
CREATE INDEX idx_invoices_contract ON invoices(contract_id);
CREATE INDEX idx_invoices_approval ON invoices(approval_status);
CREATE INDEX idx_invoices_payment ON invoices(payment_status);
CREATE INDEX idx_contracts_vendor ON contracts(vendor_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
