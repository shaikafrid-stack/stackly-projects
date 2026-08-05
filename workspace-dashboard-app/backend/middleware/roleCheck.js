const pool = require('../config/db');

// Restrict a route to a fixed set of roles
function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

// Ensures the logged-in user is either an Administrator, or a member
// (Manager/Member) of the workspace identified by req.params.id / req.body.workspace_id.
// Attaches req.workspaceRole = 'Administrator' | 'Workspace Manager' | 'Member' | null
async function requireWorkspaceAccess(req, res, next) {
  try {
    const workspaceId = req.params.id || req.params.workspaceId || req.body.workspace_id;
    if (!workspaceId) return res.status(400).json({ message: 'workspace_id is required.' });

    if (req.user.role === 'Administrator') {
      req.workspaceRole = 'Administrator';
      return next();
    }

    const [rows] = await pool.query(
      'SELECT member_role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
      [workspaceId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: 'You do not have access to this workspace.' });
    }

    req.workspaceRole = rows[0].member_role;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error checking workspace access.' });
  }
}

module.exports = { allowRoles, requireWorkspaceAccess };
