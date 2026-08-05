const express = require('express');
const pool = require('../config/db');
const authenticate = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/activity?workspace_id=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { workspace_id, page = 1, limit = 15 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let scopeClause = '1=1';
    let scopeParams = [];

    if (req.user.role !== 'Administrator') {
      const [rows] = await pool.query('SELECT workspace_id FROM workspace_members WHERE user_id = ?', [req.user.id]);
      const ids = rows.map((r) => r.workspace_id);
      if (ids.length === 0) return res.json({ data: [], total: 0, page: Number(page), limit: Number(limit) });
      if (workspace_id && !ids.includes(Number(workspace_id))) {
        return res.status(403).json({ message: 'You do not have access to this workspace.' });
      }
      scopeClause = `al.workspace_id IN (${ids.map(() => '?').join(',')})`;
      scopeParams = ids;
    }

    if (workspace_id) {
      scopeClause += ' AND al.workspace_id = ?';
      scopeParams.push(Number(workspace_id));
    }

    const [rows] = await pool.query(
      `SELECT al.*, u.name AS user_name, w.workspace_name FROM activity_logs al
       JOIN users u ON u.id = al.user_id
       LEFT JOIN workspaces w ON w.id = al.workspace_id
       WHERE ${scopeClause}
       ORDER BY al.activity_time DESC
       LIMIT ? OFFSET ?`,
      [...scopeParams, Number(limit), offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM activity_logs al WHERE ${scopeClause}`,
      scopeParams
    );

    res.json({ data: rows, total: countRows[0].total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching activity.' });
  }
});

module.exports = router;
