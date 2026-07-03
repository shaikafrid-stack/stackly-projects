// Seeds the database with test users / vendors / contracts / invoices
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('Seeding database...');
    const password = await bcrypt.hash('Password123!', 10);

    // Users
    const [adminRes] = await conn.query(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE name=VALUES(name)`,
      ['System Admin', 'admin@vcims.com', password]
    );
    const [financeRes] = await conn.query(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'finance_manager')
       ON DUPLICATE KEY UPDATE name=VALUES(name)`,
      ['Finance Manager', 'finance@vcims.com', password]
    );
    const [vendorUserRes] = await conn.query(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'vendor')
       ON DUPLICATE KEY UPDATE name=VALUES(name)`,
      ['Acme Supplies Contact', 'vendor@vcims.com', password]
    );

    const [[vendorUser]] = await conn.query(`SELECT id FROM users WHERE email = 'vendor@vcims.com'`);

    const [vendorRes] = await conn.query(
      `INSERT INTO vendors (user_id, vendor_name, contact_person, phone, email, address, status)
       VALUES (?, 'Acme Supplies Pvt Ltd', 'John Doe', '9876543210', 'vendor@vcims.com', '123 Market Street, Hyderabad', 'active')`,
      [vendorUser.id]
    );
    const vendorId = vendorRes.insertId;

    // a second vendor without login, for variety in analytics
    const [vendor2Res] = await conn.query(
      `INSERT INTO vendors (vendor_name, contact_person, phone, email, address, status)
       VALUES ('Global Traders Inc', 'Jane Smith', '9998887777', 'contact@globaltraders.com', '45 Industrial Area, Pune', 'active')`
    );
    const vendor2Id = vendor2Res.insertId;

    const [contractRes] = await conn.query(
      `INSERT INTO contracts (vendor_id, contract_title, start_date, end_date, contract_value, status)
       VALUES (?, 'Office Supplies Annual Contract', '2026-01-01', '2026-12-31', 500000, 'active')`,
      [vendorId]
    );
    const contractId = contractRes.insertId;

    const [contract2Res] = await conn.query(
      `INSERT INTO contracts (vendor_id, contract_title, start_date, end_date, contract_value, status)
       VALUES (?, 'IT Hardware Supply Contract', '2026-02-01', '2027-01-31', 1200000, 'active')`,
      [vendor2Id]
    );
    const contract2Id = contract2Res.insertId;

    const [inv1] = await conn.query(
      `INSERT INTO invoices (vendor_id, contract_id, invoice_number, invoice_amount, invoice_date, due_date, payment_status, approval_status)
       VALUES (?, ?, 'INV-1001', 45000, '2026-05-01', '2026-05-31', 'Paid', 'Approved')`,
      [vendorId, contractId]
    );
    const [inv2] = await conn.query(
      `INSERT INTO invoices (vendor_id, contract_id, invoice_number, invoice_amount, invoice_date, due_date, payment_status, approval_status)
       VALUES (?, ?, 'INV-1002', 32000, '2026-06-05', '2026-07-05', 'Unpaid', 'Pending')`,
      [vendorId, contractId]
    );
    const [inv3] = await conn.query(
      `INSERT INTO invoices (vendor_id, contract_id, invoice_number, invoice_amount, invoice_date, due_date, payment_status, approval_status)
       VALUES (?, ?, 'INV-2001', 150000, '2026-06-10', '2026-07-10', 'Partially Paid', 'Approved')`,
      [vendor2Id, contract2Id]
    );
    await conn.query(
      `INSERT INTO invoices (vendor_id, contract_id, invoice_number, invoice_amount, invoice_date, due_date, payment_status, approval_status)
       VALUES (?, ?, 'INV-2002', 90000, '2026-06-20', '2026-07-20', 'Unpaid', 'Rejected')`,
      [vendor2Id, contract2Id]
    );

    await conn.query(
      `INSERT INTO payments (invoice_id, payment_amount, payment_date, payment_mode, transaction_reference)
       VALUES (?, 45000, '2026-05-20', 'Bank Transfer', 'TXN-INV1001-A')`,
      [inv1.insertId]
    );
    await conn.query(
      `INSERT INTO payments (invoice_id, payment_amount, payment_date, payment_mode, transaction_reference)
       VALUES (?, 75000, '2026-06-25', 'UPI', 'TXN-INV2001-A')`,
      [inv3.insertId]
    );

    await conn.query(
      `INSERT INTO invoice_comments (invoice_id, user_id, comment) VALUES (?, ?, 'Invoice looks good, approved for payment.')`,
      [inv1.insertId, financeRes.insertId]
    );

    console.log('Seed complete.');
    console.log('Test credentials (password for all: Password123!):');
    console.log('  Admin:            admin@vcims.com');
    console.log('  Finance Manager:  finance@vcims.com');
    console.log('  Vendor:           vendor@vcims.com');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    conn.release();
    process.exit();
  }
}

seed();
