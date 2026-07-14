-- Seed data for testing
-- Seed data for testing
-- All test users share the password: password123

USE expense_reimbursement;

INSERT INTO users (name, email, password, role) VALUES
('Alice Admin',   'admin@company.com',    '$2a$10$RPvygcdOiyvRO4dvBLhJT.a/wWDHMnwRoZq9IYa/i1ziBQEO.j7cK', 'admin'),
('Mark Manager',  'manager@company.com',  '$2a$10$RPvygcdOiyvRO4dvBLhJT.a/wWDHMnwRoZq9IYa/i1ziBQEO.j7cK', 'manager'),
('Eve Employee',  'employee@company.com', '$2a$10$RPvygcdOiyvRO4dvBLhJT.a/wWDHMnwRoZq9IYa/i1ziBQEO.j7cK', 'employee'),
('John Doe',      'john@company.com',     '$2a$10$RPvygcdOiyvRO4dvBLhJT.a/wWDHMnwRoZq9IYa/i1ziBQEO.j7cK', 'employee');

INSERT INTO expenses (employee_id, title, category, amount, expense_date, description, receipt, status) VALUES
(3, 'Client Flight to Mumbai', 'Travel', 12500.00, '2026-06-10', 'Round trip flight for client meeting', 'flight_receipt.pdf', 'Pending'),
(3, 'Team Lunch', 'Food', 2200.00, '2026-06-15', 'Lunch with visiting client team', 'lunch_receipt.jpg', 'Approved'),
(3, 'Hotel Stay - Bangalore', 'Accommodation', 8000.00, '2026-06-18', '2 nights hotel stay for conference', 'hotel_receipt.pdf', 'Rejected'),
(4, 'Laptop Stand', 'Office Supplies', 1500.00, '2026-06-20', 'Ergonomic laptop stand for WFH setup', 'amazon_invoice.pdf', 'Pending'),
(4, 'Figma Subscription', 'Software', 900.00, '2026-06-22', 'Monthly design tool subscription', 'figma_invoice.pdf', 'Approved');
