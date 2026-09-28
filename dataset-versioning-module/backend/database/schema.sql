-- ============================================================================
-- Dataset Versioning, Lineage & Change Tracking Module
-- MySQL Schema
-- ============================================================================

CREATE DATABASE IF NOT EXISTS dataset_versioning_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE dataset_versioning_db;

-- ----------------------------------------------------------------------------
-- Table: Dataset
-- One row per logical dataset. The dataset itself never stores data content;
-- content and schema live in DatasetVersion so history is never overwritten.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Dataset (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL UNIQUE,
  description   TEXT,
  status        ENUM('Active', 'Archived') NOT NULL DEFAULT 'Active',
  created_by    VARCHAR(100) NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table: DatasetVersion
-- Every change produces a NEW row here rather than mutating an old one.
-- parent_version_id forms a singly-linked chain (and, after a restore, a
-- branch) that the lineage view walks to reconstruct dataset history.
-- schema_json snapshots the column list / transformations / validation
-- rules at that point in time, which the diff engine compares against.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS DatasetVersion (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  dataset_id        INT NOT NULL,
  version_number    INT NOT NULL,
  version_label     VARCHAR(150) NOT NULL,
  parent_version_id INT NULL,
  record_count      INT NOT NULL DEFAULT 0,
  status            ENUM('Draft', 'Active', 'Archived', 'Restored') NOT NULL DEFAULT 'Draft',
  change_summary    VARCHAR(500),
  schema_json       JSON NULL,
  created_by        VARCHAR(100) NOT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_version_dataset
    FOREIGN KEY (dataset_id) REFERENCES Dataset(id) ON DELETE CASCADE,
  CONSTRAINT fk_version_parent
    FOREIGN KEY (parent_version_id) REFERENCES DatasetVersion(id) ON DELETE SET NULL,

  -- Prevents duplicate/invalid version numbering within a dataset
  CONSTRAINT uq_dataset_version UNIQUE (dataset_id, version_number),

  INDEX idx_version_dataset (dataset_id),
  INDEX idx_version_status (status),
  INDEX idx_version_parent (parent_version_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table: DatasetChangeLog
-- Fine-grained, append-only log of individual field/column-level changes
-- attached to the version in which they occurred. This is what powers the
-- Change History screen and the audit trail.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS DatasetChangeLog (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  version_id    INT NOT NULL,
  change_type   ENUM(
                  'COLUMN_ADDED', 'COLUMN_REMOVED', 'COLUMN_TYPE_CHANGED', 'COLUMN_RENAMED',
                  'RECORDS_ADDED', 'RECORDS_REMOVED', 'TRANSFORMATION_APPLIED',
                  'VALIDATION_CHANGED', 'STATUS_CHANGED', 'VERSION_RESTORED'
                ) NOT NULL,
  field_name    VARCHAR(150),
  old_value     TEXT,
  new_value     TEXT,
  description   VARCHAR(500) NOT NULL,
  changed_by    VARCHAR(100) NOT NULL,
  changed_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_changelog_version
    FOREIGN KEY (version_id) REFERENCES DatasetVersion(id) ON DELETE CASCADE,

  INDEX idx_changelog_version (version_id),
  INDEX idx_changelog_type (change_type),
  INDEX idx_changelog_date (changed_at)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table: AppUser (supporting role-based authorization)
-- Passwords are stored as bcrypt hashes in a production build; the seed
-- data / backend demo controller uses plain-text only for local testing.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS AppUser (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  display_name  VARCHAR(150) NOT NULL,
  role          ENUM('Admin', 'Data Steward', 'Data Analyst') NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
