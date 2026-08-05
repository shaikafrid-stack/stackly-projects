const express = require('express');
const pool = require('../config/db');
const authenticate = require('../middleware/auth');
const { allowRoles } = require('../middleware/roleCheck');

const router = express.Router();
router.use(authenticate);

// GET /api/dashboard/admin
router.get('/admin', allowRoles('Administrator'), async (req, res) => {
  try {
    const [[{ totalWorkspaces }]] = await pool.query('SELECT COUNT(*) AS totalWorkspaces FROM workspaces');
    const [[{ activeWorkspaces }]] = await pool.query(
      `SELECT COUNT(*) AS activeWorkspaces FROM workspaces WHERE status = 'Active'`
    );
    const [[{ totalDashboards }]] = await pool.query('SELECT COUNT(*) AS totalDashboards FROM dashboards');
    const [[{ totalMembers }]] = await pool.query('SELECT COUNT(*) AS totalMembers FROM users');

    const [recentDashboards] = await pool.query(
      `SELECT d.id, d.dashboard_name, d.category, d.created_at, w.workspace_name
       FROM dashboards d JOIN workspaces w ON w.id = d.workspace_id
       ORDER BY d.created_at DESC LIMIT 5`
    );

    const [workspacesByStatus] = await pool.query(
      `SELECT status AS name, COUNT(*) AS value FROM workspaces GROUP BY status`
    );

    const [dashboardsByCategory] = await pool.query(
      `SELECT category AS name, COUNT(*) AS value FROM dashboards GROUP BY category`
    );

    const [monthlyGrowth] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
       FROM workspaces GROUP BY month ORDER BY month ASC LIMIT 12`
    );

    const [userDistribution] = await pool.query(
      `SELECT w.workspace_name AS name, COUNT(wm.id) AS value
       FROM workspaces w LEFT JOIN workspace_members wm ON wm.workspace_id = w.id
       GROUP BY w.id ORDER BY value DESC LIMIT 10`
    );

    res.json({
      summary: { totalWorkspaces, activeWorkspaces, totalDashboards, totalMembers },
      recentDashboards,
      charts: { workspacesByStatus, dashboardsByCategory, monthlyGrowth, userDistribution },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error building admin summary.' });
  }
});

// GET /api/dashboard/manager
router.get('/manager', allowRoles('Workspace Manager'), async (req, res) => {
  try {
    const [workspaceRows] = await pool.query(
      'SELECT workspace_id FROM workspace_members WHERE user_id = ? AND member_role = "Workspace Manager"',
      [req.user.id]
    );
    const workspaceIds = workspaceRows.map((r) => r.workspace_id);

    if (workspaceIds.length === 0) {
      return res.json({
        summary: { totalWorkspaces: 0, totalDashboards: 0, totalMembers: 0 },
        recentDashboards: [],
        charts: { dashboardsByCategory: [] },
      });
    }

    const placeholders = workspaceIds.map(() => '?').join(',');

    const [[{ totalDashboards }]] = await pool.query(
      `SELECT COUNT(*) AS totalDashboards FROM dashboards WHERE workspace_id IN (${placeholders})`,
      workspaceIds
    );
    const [[{ totalMembers }]] = await pool.query(
      `SELECT COUNT(DISTINCT user_id) AS totalMembers FROM workspace_members WHERE workspace_id IN (${placeholders})`,
      workspaceIds
    );
    const [recentDashboards] = await pool.query(
      `SELECT d.id, d.dashboard_name, d.category, d.created_at, w.workspace_name
       FROM dashboards d JOIN workspaces w ON w.id = d.workspace_id
       WHERE d.workspace_id IN (${placeholders})
       ORDER BY d.created_at DESC LIMIT 5`,
      workspaceIds
    );
    const [dashboardsByCategory] = await pool.query(
      `SELECT category AS name, COUNT(*) AS value FROM dashboards
       WHERE workspace_id IN (${placeholders}) GROUP BY category`,
      workspaceIds
    );

    res.json({
      summary: { totalWorkspaces: workspaceIds.length, totalDashboards, totalMembers },
      recentDashboards,
      charts: { dashboardsByCategory },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error building manager summary.' });
  }
});

// GET /api/dashboard/member
router.get('/member', allowRoles('Member'), async (req, res) => {
  try {
    const [workspaceRows] = await pool.query(
      'SELECT workspace_id FROM workspace_members WHERE user_id = ?',
      [req.user.id]
    );
    const workspaceIds = workspaceRows.map((r) => r.workspace_id);

    if (workspaceIds.length === 0) {
      return res.json({ summary: { totalWorkspaces: 0, totalDashboards: 0 }, recentDashboards: [] });
    }

    const placeholders = workspaceIds.map(() => '?').join(',');
    const [[{ totalDashboards }]] = await pool.query(
      `SELECT COUNT(*) AS totalDashboards FROM dashboards WHERE workspace_id IN (${placeholders}) AND status = 'Active'`,
      workspaceIds
    );
    const [recentDashboards] = await pool.query(
      `SELECT d.id, d.dashboard_name, d.category, d.created_at, w.workspace_name
       FROM dashboards d JOIN workspaces w ON w.id = d.workspace_id
       WHERE d.workspace_id IN (${placeholders}) AND d.status = 'Active'
       ORDER BY d.created_at DESC LIMIT 5`,
      workspaceIds
    );

    res.json({
      summary: { totalWorkspaces: workspaceIds.length, totalDashboards },
      recentDashboards,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error building member summary.' });
  }
});

// GET /api/dashboard/users - Administrator only (used by User Assignment page)
router.get('/users', allowRoles('Administrator'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

module.exports = router;
