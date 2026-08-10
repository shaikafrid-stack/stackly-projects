/**
 * Programmatic seed script - creates demo users with correctly hashed passwords.
 * Run with: npm run seed  (after schema.sql has been applied)
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seed() {
  const password = await bcrypt.hash('Password@123', 10);

  const [existing] = await pool.query('SELECT COUNT(*) as count FROM users');
  if (existing[0].count > 0) {
    console.log('Users table already has data. Skipping user seed. Delete rows first to reseed.');
  } else {
    await pool.query(
      `INSERT INTO users (name, email, password, role, status) VALUES
      ('Alice Admin', 'admin@task23.com', ?, 'Administrator', 'Active'),
      ('Steven Steward', 'steward@task23.com', ?, 'Data Steward', 'Active'),
      ('Anaya Analyst', 'analyst@task23.com', ?, 'Data Analyst', 'Active')`,
      [password, password, password]
    );
    console.log('Seeded demo users. Login with Password@123 for all three accounts.');
  }

  const [ws] = await pool.query('SELECT COUNT(*) as count FROM workspaces');
  if (ws[0].count === 0) {
    const [stewardRows] = await pool.query("SELECT id FROM users WHERE role='Data Steward' LIMIT 1");
    const stewardId = stewardRows[0]?.id || null;
    await pool.query(
      `INSERT INTO workspaces (workspace_name, description, steward_id) VALUES
      ('Sales Analytics', 'Datasets related to sales performance and CRM exports', ?),
      ('Customer Insights', 'Customer behaviour and support datasets', ?)`,
      [stewardId, stewardId]
    );
    console.log('Seeded demo workspaces.');
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
