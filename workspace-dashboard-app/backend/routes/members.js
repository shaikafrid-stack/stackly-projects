const express = require('express');
const pool = require('../config/db');
const authenticate = require('../middleware/auth');
const { allowRoles, requireWorkspaceAccess } = require('../middleware/roleCheck');

const router = express.Router({ mergeParams: true });
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

// GET /api/workspaces/:id/members
router.get('/', requireWorkspaceAccess, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT wm.id, wm.member_role, wm.joined_at, u.id AS user_id, u.name, u.email, u.status
       FROM workspace_members wm
       JOIN users u ON u.id = wm.user_id
       WHERE wm.workspace_id = ?
       ORDER BY wm.joined_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching members.' });
  }
});

// POST /api/workspaces/:id/members - Administrator (invite) or Workspace Manager (manage)
router.post(
  '/',
  requireWorkspaceAccess,
  async (req, res, next) => {
    if (req.workspaceRole === 'Administrator' || req.workspaceRole === 'Workspace Manager') return next();
    return res.status(403).json({ message: 'Only Administrators or Workspace Managers can add members.' });
  },
  async (req, res) => {
    const { email, member_role = 'Member' } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    try {
      const [userRows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (userRows.length === 0) {
        return res.status(404).json({ message: 'No user found with that email. Ask them to register first.' });
      }
      const user = userRows[0];

      const [existing] = await pool.query(
        'SELECT * FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
        [req.params.id, user.id]
      );
      if (existing.length > 0) {
        return res.status(409).json({ message: 'User is already a member of this workspace.' });
      }

      await pool.query(
        'INSERT INTO workspace_members (workspace_id, user_id, member_role) VALUES (?, ?, ?)',
        [req.params.id, user.id, member_role]
      );
      await logActivity(req.params.id, req.user.id, `Added ${user.name} to the workspace as ${member_role}`);
      res.status(201).json({ message: 'Member added successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error adding member.' });
    }
  }
);

// DELETE /api/workspaces/:id/members/:memberId
router.delete(
  '/:memberId',
  requireWorkspaceAccess,
  async (req, res, next) => {
    if (req.workspaceRole === 'Administrator' || req.workspaceRole === 'Workspace Manager') return next();
    return res.status(403).json({ message: 'Only Administrators or Workspace Managers can remove members.' });
  },
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT wm.*, u.name FROM workspace_members wm JOIN users u ON u.id = wm.user_id
         WHERE wm.id = ? AND wm.workspace_id = ?`,
        [req.params.memberId, req.params.id]
      );
      if (rows.length === 0) return res.status(404).json({ message: 'Member not found.' });

      await pool.query('DELETE FROM workspace_members WHERE id = ?', [req.params.memberId]);
      await logActivity(req.params.id, req.user.id, `Removed ${rows[0].name} from the workspace`);
      res.json({ message: 'Member removed successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error removing member.' });
    }
  }
);

module.exports = router;
