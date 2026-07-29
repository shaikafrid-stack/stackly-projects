/**
 * Seed script: creates test users (admin, support engineer, employee),
 * default categories, and a couple of sample tickets/articles.
 *
 * Run with: npm run seed
 * (Make sure schema.sql has already been applied and .env is configured.)
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function seed() {
  const password = await bcrypt.hash('Password123', 10);

  console.log('Seeding users...');
  const users = [
    ['Alice Admin', 'admin@helpdesk.com', 'admin'],
    ['Sam Support', 'support@helpdesk.com', 'support_engineer'],
    ['Eddie Employee', 'employee@helpdesk.com', 'employee'],
  ];

  const ids = {};
  for (const [name, email, role] of users) {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      ids[role] = existing[0].id;
      console.log(`  - ${email} already exists, skipping.`);
      continue;
    }
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    ids[role] = result.insertId;
    console.log(`  - created ${email} (${role})`);
  }

  console.log('Seeding categories...');
  const categories = [
    ['Hardware', 'Issues related to laptops, desktops, peripherals'],
    ['Software', 'Application installs, bugs, licensing'],
    ['Network', 'VPN, WiFi, connectivity issues'],
    ['Access', 'Account access, permissions, password resets'],
    ['HR/Payroll', 'HR system and payroll related queries'],
  ];
  for (const [category_name, description] of categories) {
    const [existing] = await pool.query(
      'SELECT id FROM ticket_categories WHERE category_name = ?', [category_name]
    );
    if (existing.length === 0) {
      await pool.query(
        'INSERT INTO ticket_categories (category_name, description) VALUES (?, ?)',
        [category_name, description]
      );
      console.log(`  - created category ${category_name}`);
    }
  }

  console.log('Seeding a sample ticket...');
  const [existingTickets] = await pool.query('SELECT id FROM tickets LIMIT 1');
  if (existingTickets.length === 0 && ids.employee) {
    const [result] = await pool.query(
      `INSERT INTO tickets (employee_id, assigned_engineer_id, title, description, category, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ids.employee, ids.support_engineer || null, 'Laptop will not turn on',
       'My laptop screen stays black even after charging overnight.', 'Hardware', 'High', 'Open']
    );
    await pool.query(
      'INSERT INTO ticket_comments (ticket_id, user_id, comment, status_at_comment) VALUES (?, ?, ?, ?)',
      [result.insertId, ids.employee, 'Ticket created.', 'Open']
    );
    console.log('  - created sample ticket');
  }

  console.log('Seeding a sample KB article...');
  const [existingArticles] = await pool.query('SELECT id FROM knowledge_base LIMIT 1');
  if (existingArticles.length === 0 && ids.support_engineer) {
    await pool.query(
      `INSERT INTO knowledge_base (title, category, content, created_by) VALUES (?, ?, ?, ?)`,
      ['How to reset your VPN connection', 'Network',
       'Step 1: Disconnect the VPN client.\nStep 2: Restart your network adapter.\nStep 3: Reconnect using your credentials.',
       ids.support_engineer]
    );
    console.log('  - created sample article');
  }

  console.log('\nSeed complete. Test credentials (password: Password123):');
  console.log('  Admin:            admin@helpdesk.com');
  console.log('  Support Engineer: support@helpdesk.com');
  console.log('  Employee:         employee@helpdesk.com');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
