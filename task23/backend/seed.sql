-- Seed data for Task 23
-- NOTE: passwords below are bcrypt hashes of "Password@123"
-- Run `npm run seed` instead if you want the hash generated dynamically.
USE task23_dataset_mgmt;

INSERT INTO users (name, email, password, role, status) VALUES
('Alice Admin', 'admin@task23.com', '$2a$10$VYI81G7T74FCP2yXIBNaYe45DyeoQgRDCQC7NYKRo8q0oo5B9E05q', 'Administrator', 'Active'),
('Steven Steward', 'steward@task23.com', '$2a$10$VYI81G7T74FCP2yXIBNaYe45DyeoQgRDCQC7NYKRo8q0oo5B9E05q', 'Data Steward', 'Active'),
('Anaya Analyst', 'analyst@task23.com', '$2a$10$VYI81G7T74FCP2yXIBNaYe45DyeoQgRDCQC7NYKRo8q0oo5B9E05q', 'Data Analyst', 'Active');

INSERT INTO workspaces (workspace_name, description, steward_id) VALUES
('Sales Analytics', 'Datasets related to sales performance and CRM exports', 2),
('Customer Insights', 'Customer behaviour and support datasets', 2);

INSERT INTO datasets (workspace_id, dataset_name, description, category, owner_id, data_source, version, status) VALUES
(1, 'Q1 Sales Transactions', 'Raw transaction records for Q1', 'Sales', 2, 'Internal ERP Export', 'v1.2', 'Published'),
(1, 'Regional Sales Summary', 'Aggregated sales by region', 'Sales', 2, 'Data Warehouse', 'v1.0', 'Draft'),
(2, 'Support Ticket Logs', 'Customer support ticket history', 'Customer Support', 2, 'Zendesk API', 'v2.0', 'Published'),
(2, 'Churn Risk Dataset', 'Model-ready churn features', 'Customer Analytics', 2, 'ML Feature Store', 'v1.0', 'Archived');

INSERT INTO dataset_tags (dataset_id, tag_name) VALUES
(1, 'transactions'), (1, 'q1'), (2, 'summary'), (3, 'support'), (4, 'churn'), (4, 'ml');

INSERT INTO dataset_activity (dataset_id, user_id, activity, version) VALUES
(1, 2, 'Dataset created', 'v1.0'),
(1, 2, 'Metadata updated - added data source', 'v1.1'),
(1, 2, 'Published dataset', 'v1.2'),
(3, 2, 'Dataset created', 'v1.0'),
(3, 2, 'Version updated with new schema', 'v2.0');

-- Test Credentials (see README):
-- admin@task23.com    / Password@123  (Administrator)
-- steward@task23.com  / Password@123  (Data Steward)
-- analyst@task23.com  / Password@123  (Data Analyst)
