const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// GET /api/users  (admin only)
exports.getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
};

// GET /api/users/engineers  (for ticket assignment dropdown)
exports.getEngineers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email FROM users WHERE role = 'support_engineer' ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error('Get engineers error:', err);
    res.status(500).json({ message: 'Server error while fetching engineers.' });
  }
};

// PUT /api/users/:id  (admin only - update role/name)
exports.updateUser = async (req, res) => {
  try {
    const { name, role } = req.body;
    const updates = [];
    const params = [];
    if (name) { updates.push('name = ?'); params.push(name); }
    if (role) {
      if (!['admin', 'support_engineer', 'employee'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role.' });
      }
      updates.push('role = ?'); params.push(role);
    }
    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update.' });

    params.push(req.params.id);
    const [result] = await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User updated successfully.' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Server error while updating user.' });
  }
};

// DELETE /api/users/:id  (admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id, 10) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error while deleting user.' });
  }
};
