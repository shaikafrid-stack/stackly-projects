/**
 * Seed script — creates demo users, assets, and a sample service request.
 * Run with: npm run seed
 */
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seed() {
  try {
    console.log('Seeding database...');

    const password = await bcrypt.hash('Password@123', 10);

    const users = [
      ['Alice Admin', 'admin@company.com', password, 'admin'],
      ['Ethan Engineer', 'engineer@company.com', password, 'maintenance_engineer'],
      ['Emma Employee', 'employee@company.com', password, 'employee'],
    ];

    for (const [name, email, pwd, role] of users) {
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (!existing.length) {
        await db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [
          name,
          email,
          pwd,
          role,
        ]);
        console.log(`Created user: ${email} / Password@123`);
      } else {
        console.log(`User already exists: ${email}`);
      }
    }

    const [[employee]] = await db.query("SELECT id FROM users WHERE email = 'employee@company.com'");

    const assets = [
      ['Dell Latitude 5420 Laptop', 'AST-1001', 'IT Equipment', '2023-01-15', '2026-01-15', 'active', employee.id],
      ['HP LaserJet Printer', 'AST-1002', 'IT Equipment', '2022-06-10', '2024-06-10', 'active', null],
      ['Office AC Unit - Floor 2', 'AST-1003', 'HVAC', '2021-03-20', '2025-03-20', 'active', null],
    ];

    for (const asset of assets) {
      const [existing] = await db.query('SELECT id FROM assets WHERE asset_code = ?', [asset[1]]);
      if (!existing.length) {
        await db.query(
          `INSERT INTO assets (asset_name, asset_code, category, purchase_date, warranty_expiry, status, assigned_to)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          asset
        );
        console.log(`Created asset: ${asset[1]}`);
      } else {
        console.log(`Asset already exists: ${asset[1]}`);
      }
    }

    console.log('✅ Seeding complete.');
    console.log('\nTest credentials (password for all: Password@123):');
    console.log('  Admin:      admin@company.com');
    console.log('  Engineer:   engineer@company.com');
    console.log('  Employee:   employee@company.com');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
