/**
 * Seed script - creates test users, shifts, and sample data.
 * Run with: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('Seeding database...');

    const passwordHash = await bcrypt.hash('Password123!', 10);

    // Clear existing data (order matters due to FKs)
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE regularization_requests');
    await conn.query('TRUNCATE TABLE attendance');
    await conn.query('TRUNCATE TABLE users');
    await conn.query('TRUNCATE TABLE shifts');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // Shifts
    const [shiftResult] = await conn.query(
      `INSERT INTO shifts (shift_name, start_time, end_time, grace_minutes) VALUES
       ('Morning Shift', '09:00:00', '17:00:00', 15),
       ('Evening Shift', '14:00:00', '22:00:00', 15),
       ('Night Shift', '22:00:00', '06:00:00', 15)`
    );
    const morningShiftId = shiftResult.insertId;

    // Admin
    const [adminRes] = await conn.query(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')`,
      ['System Admin', 'admin@company.com', passwordHash]
    );
    const adminId = adminRes.insertId;

    // Manager
    const [managerRes] = await conn.query(
      `INSERT INTO users (name, email, password, role, shift_id) VALUES (?, ?, ?, 'manager', ?)`,
      ['Meera Manager', 'manager@company.com', passwordHash, morningShiftId]
    );
    const managerId = managerRes.insertId;

    // Employees
    const employees = [
      ['Arjun Employee', 'employee1@company.com'],
      ['Priya Employee', 'employee2@company.com'],
      ['Rahul Employee', 'employee3@company.com'],
    ];
    const employeeIds = [];
    for (const [name, email] of employees) {
      const [res] = await conn.query(
        `INSERT INTO users (name, email, password, role, manager_id, shift_id) VALUES (?, ?, ?, 'employee', ?, ?)`,
        [name, email, passwordHash, managerId, morningShiftId]
      );
      employeeIds.push(res.insertId);
    }

    // Sample attendance for the last 5 days for each employee
    const today = new Date();
    for (const empId of employeeIds) {
      for (let i = 1; i <= 5; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const checkIn = `${dateStr} 09:05:00`;
        const checkOut = `${dateStr} 17:10:00`;
        await conn.query(
          `INSERT INTO attendance (employee_id, shift_id, attendance_date, check_in, check_out, total_hours, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [empId, morningShiftId, dateStr, checkIn, checkOut, 8.08, 'Present']
        );
      }
    }

    console.log('Seed complete.');
    console.log('Test credentials (password for all: Password123!):');
    console.log('  Admin:    admin@company.com');
    console.log('  Manager:  manager@company.com');
    console.log('  Employee: employee1@company.com / employee2@company.com / employee3@company.com');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
