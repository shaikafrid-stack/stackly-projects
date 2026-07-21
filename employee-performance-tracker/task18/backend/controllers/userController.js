const bcrypt = require('bcryptjs');
const pool = require('../config/db');

exports.getMyTeam = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, department FROM users WHERE manager_id = ? AND role = "employee" ORDER BY name ASC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch team', error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, department, search } = req.query;
    const conditions = [];
    const params = [];

    if (role) { conditions.push('role = ?'); params.push(role); }
    if (department) { conditions.push('department = ?'); params.push(department); }
    if (search) { conditions.push('(name LIKE ? OR email LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT id, name, email, role, department, manager_id, created_at FROM users ${whereClause} ORDER BY name ASC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, manager_id } = req.body;
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, department, manager_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashed, role || 'employee', department || 'General', manager_id || null]
    );
    const [rows] = await pool.query('SELECT id, name, email, role, department, manager_id FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, role, department, manager_id } = req.body;
    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (role !== undefined) { fields.push('role = ?'); params.push(role); }
    if (department !== undefined) { fields.push('department = ?'); params.push(department); }
    if (manager_id !== undefined) { fields.push('manager_id = ?'); params.push(manager_id); }

    if (!fields.length) return res.status(400).json({ message: 'No valid fields to update' });

    params.push(req.params.id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.query('SELECT id, name, email, role, department, manager_id FROM users WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};
