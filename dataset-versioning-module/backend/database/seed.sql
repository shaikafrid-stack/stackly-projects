-- ============================================================================
-- Seed data: demo users, two datasets, each with a version chain and
-- change-log entries, so the frontend has something meaningful to show
-- immediately after setup.
-- ============================================================================

USE dataset_versioning_db;

INSERT INTO AppUser (username, display_name, role) VALUES
  ('admin', 'Ava Admin', 'Admin'),
  ('steward', 'Sam Steward', 'Data Steward'),
  ('analyst', 'Ana Analyst', 'Data Analyst');

-- ---------------------------------------------------------------------------
-- Dataset 1: Customer Transactions
-- ---------------------------------------------------------------------------
INSERT INTO Dataset (name, description, status, created_by, created_at) VALUES
  ('Customer Transactions', 'Raw and cleaned customer transaction records used for revenue reporting.', 'Active', 'admin', '2026-08-01 09:00:00');

SET @ds1 = LAST_INSERT_ID();

INSERT INTO DatasetVersion (dataset_id, version_number, version_label, parent_version_id, record_count, status, change_summary, schema_json, created_by, created_at) VALUES
  (@ds1, 1, 'v1 - Original Import', NULL, 10000, 'Archived', 'Initial raw import from source CSV',
   JSON_OBJECT('columns', JSON_ARRAY(
      JSON_OBJECT('name','transaction_id','type','VARCHAR','nullable', false),
      JSON_OBJECT('name','customer_id','type','VARCHAR','nullable', false),
      JSON_OBJECT('name','amount','type','VARCHAR','nullable', true),
      JSON_OBJECT('name','txn_date','type','VARCHAR','nullable', true)
   ), 'transformations', JSON_ARRAY(), 'validationRules', JSON_ARRAY()),
   'admin', '2026-08-01 09:05:00');

SET @v1_1 = LAST_INSERT_ID();

INSERT INTO DatasetVersion (dataset_id, version_number, version_label, parent_version_id, record_count, status, change_summary, schema_json, created_by, created_at) VALUES
  (@ds1, 2, 'v2 - Cleaned Version', @v1_1, 9875, 'Archived', 'Removed duplicate rows, fixed amount data type, dropped 125 malformed records',
   JSON_OBJECT('columns', JSON_ARRAY(
      JSON_OBJECT('name','transaction_id','type','VARCHAR','nullable', false),
      JSON_OBJECT('name','customer_id','type','VARCHAR','nullable', false),
      JSON_OBJECT('name','amount','type','DECIMAL','nullable', false),
      JSON_OBJECT('name','txn_date','type','DATE','nullable', true)
   ), 'transformations', JSON_ARRAY('Deduplicate rows', 'Cast amount to DECIMAL(10,2)', 'Parse txn_date to DATE'),
      'validationRules', JSON_ARRAY('amount must be > 0')),
   'steward', '2026-08-05 14:20:00');

SET @v1_2 = LAST_INSERT_ID();

INSERT INTO DatasetVersion (dataset_id, version_number, version_label, parent_version_id, record_count, status, change_summary, schema_json, created_by, created_at) VALUES
  (@ds1, 3, 'v3 - Transformed Version', @v1_2, 9875, 'Active', 'Added region column derived from customer lookup; added currency validation',
   JSON_OBJECT('columns', JSON_ARRAY(
      JSON_OBJECT('name','transaction_id','type','VARCHAR','nullable', false),
      JSON_OBJECT('name','customer_id','type','VARCHAR','nullable', false),
      JSON_OBJECT('name','amount','type','DECIMAL','nullable', false),
      JSON_OBJECT('name','txn_date','type','DATE','nullable', true),
      JSON_OBJECT('name','region','type','VARCHAR','nullable', true)
   ), 'transformations', JSON_ARRAY('Deduplicate rows', 'Cast amount to DECIMAL(10,2)', 'Parse txn_date to DATE', 'Derive region from customer_id lookup'),
      'validationRules', JSON_ARRAY('amount must be > 0', 'region must be one of known regions')),
   'steward', '2026-08-12 11:40:00');

SET @v1_3 = LAST_INSERT_ID();

INSERT INTO DatasetChangeLog (version_id, change_type, field_name, old_value, new_value, description, changed_by, changed_at) VALUES
  (@v1_2, 'RECORDS_REMOVED', NULL, '10000', '9875', 'Record count changed by -125 (duplicate/malformed rows removed)', 'steward', '2026-08-05 14:20:00'),
  (@v1_2, 'COLUMN_TYPE_CHANGED', 'amount', 'VARCHAR', 'DECIMAL', 'Column \'amount\' type changed from VARCHAR to DECIMAL', 'steward', '2026-08-05 14:20:00'),
  (@v1_2, 'COLUMN_TYPE_CHANGED', 'txn_date', 'VARCHAR', 'DATE', 'Column \'txn_date\' type changed from VARCHAR to DATE', 'steward', '2026-08-05 14:20:00'),
  (@v1_2, 'TRANSFORMATION_APPLIED', NULL, NULL, 'Deduplicate rows', 'Transformation applied: Deduplicate rows', 'steward', '2026-08-05 14:20:00'),
  (@v1_3, 'COLUMN_ADDED', 'region', NULL, 'VARCHAR', 'Column \'region\' (VARCHAR) was added', 'steward', '2026-08-12 11:40:00'),
  (@v1_3, 'VALIDATION_CHANGED', NULL, NULL, 'region must be one of known regions', 'Validation rule added: region must be one of known regions', 'steward', '2026-08-12 11:40:00');

-- ---------------------------------------------------------------------------
-- Dataset 2: Product Catalog
-- ---------------------------------------------------------------------------
INSERT INTO Dataset (name, description, status, created_by, created_at) VALUES
  ('Product Catalog', 'Master product catalog including pricing and inventory attributes.', 'Active', 'admin', '2026-09-01 10:00:00');

SET @ds2 = LAST_INSERT_ID();

INSERT INTO DatasetVersion (dataset_id, version_number, version_label, parent_version_id, record_count, status, change_summary, schema_json, created_by, created_at) VALUES
  (@ds2, 1, 'v1 - Initial Version', NULL, 500, 'Active', 'Initial dataset creation',
   JSON_OBJECT('columns', JSON_ARRAY(
      JSON_OBJECT('name','sku','type','VARCHAR','nullable', false),
      JSON_OBJECT('name','product_name','type','VARCHAR','nullable', false),
      JSON_OBJECT('name','price','type','DECIMAL','nullable', false),
      JSON_OBJECT('name','stock_qty','type','INT','nullable', false)
   ), 'transformations', JSON_ARRAY(), 'validationRules', JSON_ARRAY('price must be >= 0')),
   'steward', '2026-09-01 10:05:00');

SET @v2_1 = LAST_INSERT_ID();

INSERT INTO DatasetChangeLog (version_id, change_type, field_name, old_value, new_value, description, changed_by, changed_at) VALUES
  (@v2_1, 'RECORDS_ADDED', NULL, '0', '500', 'Record count changed by 500 (initial load)', 'steward', '2026-09-01 10:05:00');
