// Run with: npm run seed
// Inserts demo users (Administrator / Workspace Manager / Member),
// a sample workspace, members, dashboards and activity logs.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  try {
    const password = await bcrypt.hash('Password123!', 10);

    console.log('Seeding users...');
    const [adminRes] = await pool.query(
      `INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, 'Active')`,
      ['Admin User', 'admin@example.com', password, 'Administrator']
    );
    const [managerRes] = await pool.query(
      `INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, 'Active')`,
      ['Manager User', 'manager@example.com', password, 'Workspace Manager']
    );
    const [memberRes] = await pool.query(
      `INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, 'Active')`,
      ['Member User', 'member@example.com', password, 'Member']
    );

    const adminId = adminRes.insertId;
    const managerId = managerRes.insertId;
    const memberId = memberRes.insertId;

    console.log('Seeding workspace...');
    const [wsRes] = await pool.query(
      `INSERT INTO workspaces (workspace_name, description, created_by, status) VALUES (?, ?, ?, 'Active')`,
      ['Marketing Analytics', 'Workspace for the marketing team dashboards', adminId]
    );
    const workspaceId = wsRes.insertId;

    console.log('Adding workspace members...');
    await pool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, member_role) VALUES (?, ?, 'Workspace Manager')`,
      [workspaceId, managerId]
    );
    await pool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, member_role) VALUES (?, ?, 'Member')`,
      [workspaceId, memberId]
    );

    console.log('Seeding dashboards...');
    await pool.query(
      `INSERT INTO dashboards (workspace_id, dashboard_name, category, description, status, created_by)
       VALUES (?, 'Campaign Performance', 'Marketing', 'Tracks campaign ROI and reach', 'Active', ?)`,
      [workspaceId, managerId]
    );
    await pool.query(
      `INSERT INTO dashboards (workspace_id, dashboard_name, category, description, status, created_by)
       VALUES (?, 'Social Media Growth', 'Social', 'Follower and engagement trends', 'Active', ?)`,
      [workspaceId, managerId]
    );

    console.log('Seeding activity logs...');
    await pool.query(
      `INSERT INTO activity_logs (workspace_id, user_id, activity) VALUES (?, ?, 'Created workspace "Marketing Analytics"')`,
      [workspaceId, adminId]
    );
    await pool.query(
      `INSERT INTO activity_logs (workspace_id, user_id, activity) VALUES (?, ?, 'Created dashboard "Campaign Performance"')`,
      [workspaceId, managerId]
    );

    console.log('\nSeed complete! Test credentials (password for all: Password123!):');
    console.log('  Administrator : admin@example.com');
    console.log('  Manager       : manager@example.com');
    console.log('  Member        : member@example.com');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
