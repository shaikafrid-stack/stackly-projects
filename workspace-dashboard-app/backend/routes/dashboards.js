const express = require('express');
const pool = require('../config/db');
const authenticate = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

async function logActivity(workspaceId, userId, activity) {
  try {
    await pool.query(
      'INSERT INTO activity_logs (workspace_id, user_id, activity) VALUES (?, ?, ?)',
      [workspaceId, userId, activity]
    );
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
}

async function getMemberRole(workspaceId, userId) {
  const [rows] = await pool.query(
    'SELECT member_role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
    [workspaceId, userId]
  );
  return rows.length ? rows[0].member_role : null;
}

// GET /api/dashboards?workspace_id=&search=&category=&status=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { workspace_id, search = '', category = '', status = '', page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let workspaceFilterIds = [];
    if (req.user.role !== 'Administrator') {
      const [rows] = await pool.query('SELECT workspace_id FROM workspace_members WHERE user_id = ?', [req.user.id]);
      workspaceFilterIds = rows.map((r) => r.workspace_id);
      if (workspace_id && !workspaceFilterIds.includes(Number(workspace_id))) {
        return res.status(403).json({ message: 'You do not have access to this workspace.' });
      }
      if (workspaceFilterIds.length === 0) {
        return res.json({ data: [], total: 0, page: Number(page), limit: Number(limit) });
      }
    }

    const ids = workspace_id ? [Number(workspace_id)] : workspaceFilterIds;
    const scopeClause =
      req.user.role === 'Administrator'
        ? workspace_id
          ? 'd.workspace_id = ?'
          : '1=1'
        : `d.workspace_id IN (${ids.map(() => '?').join(',')})`;
    const scopeParams = req.user.role === 'Administrator' ? (workspace_id ? [Number(workspace_id)] : []) : ids;

    const dataQuery = `
      SELECT d.*, w.workspace_name, u.name AS created_by_name
      FROM dashboards d
      JOIN workspaces w ON w.id = d.workspace_id
      JOIN users u ON u.id = d.created_by
      WHERE ${scopeClause} AND d.dashboard_name LIKE ? AND d.category LIKE ? AND d.status LIKE ?
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?`;
    const countQuery = `
      SELECT COUNT(*) AS total FROM dashboards d
      WHERE ${scopeClause} AND d.dashboard_name LIKE ? AND d.category LIKE ? AND d.status LIKE ?`;

    const likeParams = [`%${search}%`, `%${category}%`, `%${status}%`];
    const [rows] = await pool.query(dataQuery, [...scopeParams, ...likeParams, Number(limit), offset]);
    const [countRows] = await pool.query(countQuery, [...scopeParams, ...likeParams]);

    res.json({ data: rows, total: countRows[0].total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching dashboards.' });
  }
});

// POST /api/dashboards - Administrator or Workspace Manager of that workspace
router.post('/', async (req, res) => {
  const { workspace_id, dashboard_name, category = 'General', description = '', status = 'Active' } = req.body;
  if (!workspace_id || !dashboard_name) {
    return res.status(400).json({ message: 'workspace_id and dashboard_name are required.' });
  }

  try {
    if (req.user.role !== 'Administrator') {
      const role = await getMemberRole(workspace_id, req.user.id);
      if (role !== 'Workspace Manager') {
        return res.status(403).json({ message: 'Only Administrators or Workspace Managers can create dashboards.' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO dashboards (workspace_id, dashboard_name, category, description, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [workspace_id, dashboard_name, category, description, status, req.user.id]
    );
    await logActivity(workspace_id, req.user.id, `Created dashboard "${dashboard_name}"`);
    res.status(201).json({ id: result.insertId, message: 'Dashboard created successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating dashboard.' });
  }
});

// PUT /api/dashboards/:id - Administrator or Workspace Manager of that workspace
router.put('/:id', async (req, res) => {
  try {
    const [existingRows] = await pool.query('SELECT * FROM dashboards WHERE id = ?', [req.params.id]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Dashboard not found.' });
    const existing = existingRows[0];

    if (req.user.role !== 'Administrator') {
      const role = await getMemberRole(existing.workspace_id, req.user.id);
      if (role !== 'Workspace Manager') {
        return res.status(403).json({ message: 'Only Administrators or Workspace Managers can edit dashboards.' });
      }
    }

    const { dashboard_name, category, description, status } = req.body;
    await pool.query(
      `UPDATE dashboards SET dashboard_name = ?, category = ?, description = ?, status = ? WHERE id = ?`,
      [
        dashboard_name ?? existing.dashboard_name,
        category ?? existing.category,
        description ?? existing.description,
        status ?? existing.status,
        req.params.id,
      ]
    );
    await logActivity(existing.workspace_id, req.user.id, `Updated dashboard "${dashboard_name ?? existing.dashboard_name}"`);
    res.json({ message: 'Dashboard updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating dashboard.' });
  }
});

// PATCH /api/dashboards/:id/archive - Workspace Manager / Administrator
router.patch('/:id/archive', async (req, res) => {
  try {
    const [existingRows] = await pool.query('SELECT * FROM dashboards WHERE id = ?', [req.params.id]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Dashboard not found.' });
    const existing = existingRows[0];

    if (req.user.role !== 'Administrator') {
      const role = await getMemberRole(existing.workspace_id, req.user.id);
      if (role !== 'Workspace Manager') {
        return res.status(403).json({ message: 'Only Administrators or Workspace Managers can archive dashboards.' });
      }
    }

    const newStatus = existing.status === 'Archived' ? 'Active' : 'Archived';
    await pool.query('UPDATE dashboards SET status = ? WHERE id = ?', [newStatus, req.params.id]);
    await logActivity(existing.workspace_id, req.user.id, `Set dashboard "${existing.dashboard_name}" status to ${newStatus}`);
    res.json({ message: `Dashboard ${newStatus.toLowerCase()} successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error archiving dashboard.' });
  }
});

// DELETE /api/dashboards/:id - Administrator or Workspace Manager
router.delete('/:id', async (req, res) => {
  try {
    const [existingRows] = await pool.query('SELECT * FROM dashboards WHERE id = ?', [req.params.id]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Dashboard not found.' });
    const existing = existingRows[0];

    if (req.user.role !== 'Administrator') {
      const role = await getMemberRole(existing.workspace_id, req.user.id);
      if (role !== 'Workspace Manager') {
        return res.status(403).json({ message: 'Only Administrators or Workspace Managers can delete dashboards.' });
      }
    }

    await pool.query('DELETE FROM dashboards WHERE id = ?', [req.params.id]);
    res.json({ message: 'Dashboard deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting dashboard.' });
  }
});

module.exports = router;
