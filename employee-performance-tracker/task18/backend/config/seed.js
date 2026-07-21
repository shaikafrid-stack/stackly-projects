/**
 * Seeds the database with test users for each role.
 * Run with: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

const users = [
  { name: 'Alice Admin', email: 'admin@company.com', password: 'Admin@123', role: 'admin', department: 'Administration', manager_id: null },
  { name: 'Mark Manager', email: 'manager@company.com', password: 'Manager@123', role: 'manager', department: 'Engineering', manager_id: null },
  { name: 'Eve Employee', email: 'employee@company.com', password: 'Employee@123', role: 'employee', department: 'Engineering', manager_id: null },
  { name: 'Sam Staff', email: 'sam@company.com', password: 'Employee@123', role: 'employee', department: 'Engineering', manager_id: null },
];

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('Seeding users...');
    const idMap = {};

    for (const u of users) {
      const hashed = await bcrypt.hash(u.password, 10);
      const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [u.email]);
      if (existing.length) {
        idMap[u.email] = existing[0].id;
        console.log(`Skipped (exists): ${u.email}`);
        continue;
      }
      const [result] = await conn.query(
        'INSERT INTO users (name, email, password, role, department, manager_id) VALUES (?, ?, ?, ?, ?, ?)',
        [u.name, u.email, hashed, u.role, u.department, null]
      );
      idMap[u.email] = result.insertId;
      console.log(`Created: ${u.email} / ${u.password}`);
    }

    // Attach employees to the manager
    const managerId = idMap['manager@company.com'];
    if (managerId) {
      await conn.query('UPDATE users SET manager_id = ? WHERE email IN (?, ?)', [
        managerId,
        'employee@company.com',
        'sam@company.com',
      ]);
    }

    console.log('\nSeed complete. Test credentials:');
    users.forEach((u) => console.log(`  ${u.role.padEnd(9)} -> ${u.email} / ${u.password}`));
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
