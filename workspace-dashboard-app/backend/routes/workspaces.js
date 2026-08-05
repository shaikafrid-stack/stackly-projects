const express = require('express');
const pool = require('../config/db');
const authenticate = require('../middleware/auth');
const { allowRoles } = require('../middleware/roleCheck');

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

// GET /api/workspaces
// Administrator -> all workspaces. Others -> only workspaces they belong to.
router.get('/', async (req, res) => {
  try {
    const { search = '', status = '', page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let baseQuery, countQuery, params, countParams;

    if (req.user.role === 'Administrator') {
      baseQuery = `
        SELECT w.*, u.name AS created_by_name,
          (SELECT COUNT(*) FROM workspace_members wm WHERE wm.workspace_id = w.id) AS member_count,
          (SELECT COUNT(*) FROM dashboards d WHERE d.workspace_id = w.id) AS dashboard_count
        FROM workspaces w
        JOIN users u ON u.id = w.created_by
        WHERE w.workspace_name LIKE ? AND w.status LIKE ?
        ORDER BY w.created_at DESC
        LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM workspaces w WHERE w.workspace_name LIKE ? AND w.status LIKE ?`;
      params = [`%${search}%`, `%${status}%`, Number(limit), offset];
      countParams = [`%${search}%`, `%${status}%`];
    } else {
      baseQuery = `
        SELECT w.*, u.name AS created_by_name, wm.member_role,
          (SELECT COUNT(*) FROM workspace_members x WHERE x.workspace_id = w.id) AS member_count,
          (SELECT COUNT(*) FROM dashboards d WHERE d.workspace_id = w.id) AS dashboard_count
        FROM workspaces w
        JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = ?
        JOIN users u ON u.id = w.created_by
        WHERE w.workspace_name LIKE ? AND w.status LIKE ?
        ORDER BY w.created_at DESC
        LIMIT ? OFFSET ?`;
      countQuery = `
        SELECT COUNT(*) AS total FROM workspaces w
        JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = ?
        WHERE w.workspace_name LIKE ? AND w.status LIKE ?`;
      params = [req.user.id, `%${search}%`, `%${status}%`, Number(limit), offset];
      countParams = [req.user.id, `%${search}%`, `%${status}%`];
    }

    const [rows] = await pool.query(baseQuery, params);
    const [countRows] = await pool.query(countQuery, countParams);

    res.json({
      data: rows,
      total: countRows[0].total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching workspaces.' });
  }
});

// GET /api/workspaces/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT w.*, u.name AS created_by_name FROM workspaces w
       JOIN users u ON u.id = w.created_by WHERE w.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Workspace not found.' });

    if (req.user.role !== 'Administrator') {
      const [access] = await pool.query(
        'SELECT * FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );
      if (access.length === 0) {
        return res.status(403).json({ message: 'You do not have access to this workspace.' });
      }
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching workspace.' });
  }
});

// POST /api/workspaces - Administrator only
router.post('/', allowRoles('Administrator'), async (req, res) => {
  const { workspace_name, description, status = 'Active' } = req.body;
  if (!workspace_name) return res.status(400).json({ message: 'Workspace name is required.' });

  try {
    const [result] = await pool.query(
      'INSERT INTO workspaces (workspace_name, description, created_by, status) VALUES (?, ?, ?, ?)',
      [workspace_name, description || '', req.user.id, status]
    );
    await logActivity(result.insertId, req.user.id, `Created workspace "${workspace_name}"`);
    res.status(201).json({ id: result.insertId, message: 'Workspace created successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating workspace.' });
  }
});

// PUT /api/workspaces/:id - Administrator only
router.put('/:id', allowRoles('Administrator'), async (req, res) => {
  const { workspace_name, description, status } = req.body;
  try {
    const [existing] = await pool.query('SELECT * FROM workspaces WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Workspace not found.' });

    await pool.query(
      'UPDATE workspaces SET workspace_name = ?, description = ?, status = ? WHERE id = ?',
      [
        workspace_name ?? existing[0].workspace_name,
        description ?? existing[0].description,
        status ?? existing[0].status,
        req.params.id,
      ]
    );
    await logActivity(req.params.id, req.user.id, `Updated workspace "${workspace_name ?? existing[0].workspace_name}"`);
    res.json({ message: 'Workspace updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating workspace.' });
  }
});

// DELETE /api/workspaces/:id - Administrator only
router.delete('/:id', allowRoles('Administrator'), async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM workspaces WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Workspace not found.' });

    await pool.query('DELETE FROM workspaces WHERE id = ?', [req.params.id]);
    res.json({ message: 'Workspace deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting workspace.' });
  }
});

// PATCH /api/workspaces/:id/status - toggle activate/deactivate (Administrator only)
router.patch('/:id/status', allowRoles('Administrator'), async (req, res) => {
  const { status } = req.body;
  if (!['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ message: 'Status must be Active or Inactive.' });
  }
  try {
    await pool.query('UPDATE workspaces SET status = ? WHERE id = ?', [status, req.params.id]);
    await logActivity(req.params.id, req.user.id, `Set workspace status to "${status}"`);
    res.json({ message: `Workspace ${status === 'Active' ? 'activated' : 'deactivated'} successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating status.' });
  }
});

// POST /api/workspaces/:id/assign-manager - Administrator only
router.post('/:id/assign-manager', allowRoles('Administrator'), async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ message: 'user_id is required.' });

  try {
    const [existingMember] = await pool.query(
      'SELECT * FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
      [req.params.id, user_id]
    );

    if (existingMember.length > 0) {
      await pool.query(
        `UPDATE workspace_members SET member_role = 'Workspace Manager' WHERE workspace_id = ? AND user_id = ?`,
        [req.params.id, user_id]
      );
    } else {
      await pool.query(
        `INSERT INTO workspace_members (workspace_id, user_id, member_role) VALUES (?, ?, 'Workspace Manager')`,
        [req.params.id, user_id]
      );
    }

    await pool.query(`UPDATE users SET role = 'Workspace Manager' WHERE id = ? AND role = 'Member'`, [user_id]);
    await logActivity(req.params.id, req.user.id, `Assigned user #${user_id} as Workspace Manager`);
    res.json({ message: 'Workspace Manager assigned successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error assigning manager.' });
  }
});

module.exports = router;
