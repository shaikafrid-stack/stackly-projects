const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - admin: all users, manager: own team. Supports search + pagination.
router.get('/', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = ['1=1'];
    let params = [];

    if (req.user.role === 'manager') {
      where.push('u.manager_id = ?');
      params.push(req.user.id);
    }
    if (search) {
      where.push('(u.name LIKE ? OR u.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role) {
      where.push('u.role = ?');
      params.push(role);
    }

    const whereClause = where.join(' AND ');

    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM users u WHERE ${whereClause}`, params);

    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.manager_id, u.shift_id, u.is_active, s.shift_name
       FROM users u
       LEFT JOIN shifts s ON u.shift_id = s.id
       WHERE ${whereClause}
       ORDER BY u.name
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    res.json({ data: rows, total: countRows[0].total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

// GET /api/users/:id
router.get('/:id', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, manager_id, shift_id, is_active FROM users WHERE id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching user.' });
  }
});

// PUT /api/users/:id - admin only: update role, manager, active status, or reset password
router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, manager_id, is_active, password } = req.body;

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'User not found.' });

    let hashedPassword = existing[0].password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await pool.query(
      `UPDATE users SET name = ?, role = ?, manager_id = ?, is_active = ?, password = ? WHERE id = ?`,
      [
        name ?? existing[0].name,
        role ?? existing[0].role,
        manager_id !== undefined ? manager_id : existing[0].manager_id,
        is_active !== undefined ? is_active : existing[0].is_active,
        hashedPassword,
        id,
      ]
    );

    res.json({ message: 'User updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating user.' });
  }
});

// DELETE /api/users/:id - admin only
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'User not found.' });

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting user.' });
  }
});

module.exports = router;
