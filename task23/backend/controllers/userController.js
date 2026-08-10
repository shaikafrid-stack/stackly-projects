const pool = require('../config/db');

// Administrator only - used for the User Assignment page (assigning Data Stewards / owners)
async function getUsers(req, res) {
  try {
    const { role } = req.query;
    let query = 'SELECT id, name, email, role, status, created_at FROM users';
    const params = [];
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    query += ' ORDER BY name ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role, status } = req.body;
    const [existingRows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    const existing = existingRows[0];
    if (!existing) return res.status(404).json({ message: 'User not found.' });

    await pool.query('UPDATE users SET role = ?, status = ? WHERE id = ?', [
      role || existing.role,
      status || existing.status,
      id,
    ]);
    res.json({ message: 'User updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating user.' });
  }
}

module.exports = { getUsers, updateUserRole };
