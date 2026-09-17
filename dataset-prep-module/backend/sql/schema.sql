-- ============================================================
-- Dataset Preparation & Transformation Module - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS dataset_prep_module;
USE dataset_prep_module;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS validation_results;
DROP TABLE IF EXISTS transformation_history;
DROP TABLE IF EXISTS transformations;
DROP TABLE IF EXISTS dataset_versions;
DROP TABLE IF EXISTS datasets;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(120)  NOT NULL,
    email         VARCHAR(160)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          ENUM('ADMIN','DATA_STEWARD','DATA_ANALYST') NOT NULL DEFAULT 'DATA_ANALYST',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- datasets  (the "processed" datasets available for preparation)
-- ------------------------------------------------------------
CREATE TABLE datasets (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(160) NOT NULL,
    description    TEXT,
    file_name      VARCHAR(255) NOT NULL,
    file_type      VARCHAR(20)  NOT NULL DEFAULT 'CSV',
    row_count      INT NOT NULL DEFAULT 0,
    column_count   INT NOT NULL DEFAULT 0,
    quality_score  DECIMAL(5,2) DEFAULT 0,
    status         ENUM('PENDING','PROCESSING','PROCESSED','FAILED') NOT NULL DEFAULT 'PROCESSED',
    data_path      VARCHAR(255) NOT NULL, -- JSON file backing the row data
    created_by     INT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dataset_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_datasets_status (status),
    INDEX idx_datasets_name (name)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- dataset_versions  (Original / Cleaned / Prepared, etc.)
-- ------------------------------------------------------------
CREATE TABLE dataset_versions (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    dataset_id     INT NOT NULL,
    version_number INT NOT NULL,
    version_name   VARCHAR(160) NOT NULL,
    description    TEXT,
    row_count      INT NOT NULL DEFAULT 0,
    column_count   INT NOT NULL DEFAULT 0,
    data_path      VARCHAR(255), -- JSON file backing this version's row data (NULL for original -> points to dataset)
    status         ENUM('DRAFT','VALID','WARNING','FAILED') NOT NULL DEFAULT 'DRAFT',
    created_by     INT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_version_dataset FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
    CONSTRAINT fk_version_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uq_dataset_version (dataset_id, version_number),
    INDEX idx_versions_dataset (dataset_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- transformations (an ordered step within a draft/version)
-- ------------------------------------------------------------
CREATE TABLE transformations (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    dataset_id           INT NOT NULL,
    version_id           INT NULL, -- filled in once saved as a version; NULL while in draft builder
    transformation_type  VARCHAR(60) NOT NULL,
    column_name          VARCHAR(160),
    configuration        JSON,
    execution_order      INT NOT NULL DEFAULT 0,
    created_by           INT,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transform_dataset FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
    CONSTRAINT fk_transform_version FOREIGN KEY (version_id) REFERENCES dataset_versions(id) ON DELETE CASCADE,
    CONSTRAINT fk_transform_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_transform_dataset (dataset_id),
    INDEX idx_transform_order (dataset_id, execution_order)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- transformation_history (execution log / audit trail)
-- ------------------------------------------------------------
CREATE TABLE transformation_history (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    dataset_id        INT NOT NULL,
    version_id        INT NULL,
    transformation_id INT NULL,
    status            ENUM('SUCCESS','FAILED','SKIPPED') NOT NULL DEFAULT 'SUCCESS',
    records_affected  INT DEFAULT 0,
    performed_by      INT,
    executed_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details           TEXT,
    CONSTRAINT fk_hist_dataset FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
    CONSTRAINT fk_hist_version FOREIGN KEY (version_id) REFERENCES dataset_versions(id) ON DELETE CASCADE,
    CONSTRAINT fk_hist_transform FOREIGN KEY (transformation_id) REFERENCES transformations(id) ON DELETE SET NULL,
    CONSTRAINT fk_hist_user FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_hist_dataset (dataset_id),
    INDEX idx_hist_date (executed_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- validation_results
-- ------------------------------------------------------------
CREATE TABLE validation_results (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    dataset_id        INT NOT NULL,
    version_id        INT NULL,
    total_records     INT DEFAULT 0,
    valid_records     INT DEFAULT 0,
    invalid_records   INT DEFAULT 0,
    null_values       INT DEFAULT 0,
    duplicate_records INT DEFAULT 0,
    validation_status ENUM('PASSED','WARNING','FAILED') NOT NULL DEFAULT 'PASSED',
    details           JSON,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_valid_dataset FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
    CONSTRAINT fk_valid_version FOREIGN KEY (version_id) REFERENCES dataset_versions(id) ON DELETE CASCADE,
    INDEX idx_valid_dataset (dataset_id)
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Password for ALL seed users is:  Password123!
-- (bcrypt hash generated at 10 rounds)
INSERT INTO users (name, email, password_hash, role) VALUES
('Ava Administrator', 'admin@dpm.com',   '$2a$10$LPYSGRRBwLcjiXPkb/BVd.o5vSKxvOiRy.33.2D2Xj9pJ5LSxQ/Wq', 'ADMIN'),
('Steve Steward',     'steward@dpm.com','$2a$10$LPYSGRRBwLcjiXPkb/BVd.o5vSKxvOiRy.33.2D2Xj9pJ5LSxQ/Wq', 'DATA_STEWARD'),
('Amy Analyst',       'analyst@dpm.com','$2a$10$LPYSGRRBwLcjiXPkb/BVd.o5vSKxvOiRy.33.2D2Xj9pJ5LSxQ/Wq', 'DATA_ANALYST');

INSERT INTO datasets (name, description, file_name, file_type, row_count, column_count, quality_score, status, data_path, created_by) VALUES
('Customer Transactions', 'Retail customer transaction export for Q1', 'customer_transactions.csv', 'CSV', 12, 5, 82.50, 'PROCESSED', 'customer_transactions.json', 1),
('Employee Records', 'HR master employee data', 'employee_records.csv', 'CSV', 10, 6, 91.00, 'PROCESSED', 'employee_records.json', 1),
('Product Inventory', 'Warehouse product inventory snapshot', 'product_inventory.csv', 'CSV', 10, 5, 76.00, 'PROCESSED', 'product_inventory.json', 2);

INSERT INTO dataset_versions (dataset_id, version_number, version_name, description, row_count, column_count, data_path, status, created_by) VALUES
(1, 1, 'Original', 'Original unmodified dataset', 12, 5, NULL, 'VALID', 1);
