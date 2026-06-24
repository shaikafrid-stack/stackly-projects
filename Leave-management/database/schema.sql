-- Create the database
CREATE DATABASE IF NOT EXISTS resource_leave_db;
USE resource_leave_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'MANAGER', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(150) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status ENUM('ACTIVE', 'COMPLETED', 'ON_HOLD') DEFAULT 'ACTIVE'
);

-- Employee-Project assignments
CREATE TABLE IF NOT EXISTS employee_projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    assigned_date DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    leave_type ENUM('SICK', 'CASUAL', 'ANNUAL', 'MATERNITY', 'PATERNITY', 'UNPAID') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- SEED DATA - Test Credentials
-- ============================================

-- Passwords are BCrypt hashed (see README for plain text)
-- admin@company.com / admin123
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@company.com',
 '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfFB2a0OF5cvz6uEfZoQYIAy', 'ADMIN');

-- manager@company.com / manager123
INSERT INTO users (name, email, password, role) VALUES
('Manager Smith', 'manager@company.com',
 '$2a$10$8Kz5CvDQ5XHJhU2OkAvDMexEkqxLa5G0FzP0Jcp9tExhXWpOMvyci', 'MANAGER');

-- employee@company.com / emp123
INSERT INTO users (name, email, password, role) VALUES
('John Employee', 'employee@company.com',
 '$2a$10$VxH6HrpLKzJlflQPxV84a.qKH.xNOUTWJG0E5n/xLNiTRkm4HFBM6', 'EMPLOYEE');

-- Sample projects
INSERT INTO projects (project_name, description, start_date, end_date, status) VALUES
('Alpha Platform', 'Core infrastructure overhaul', '2024-01-01', '2024-12-31', 'ACTIVE'),
('Beta Mobile App', 'Cross-platform mobile application', '2024-03-01', '2024-09-30', 'ACTIVE'),
('Gamma Analytics', 'Business intelligence dashboard', '2024-06-01', NULL, 'ON_HOLD');

-- Note: Spring Boot with ddl-auto=update will auto-create tables.
-- Only run this file if you want to pre-seed the database manually.
-- The app will register users via the /api/register endpoint during normal use.
