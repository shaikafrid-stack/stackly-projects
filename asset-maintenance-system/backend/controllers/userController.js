const db = require('../config/db');
const { success, failure } = require('../utils/response');

// GET /api/users?role=maintenance_engineer  (admin only)
async function getUsers(req, res) {
  try {
    const { role } = req.query;
    const where = [];
    const params = [];

    if (role) {
      where.push('role = ?');
      params.push(role);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await db.query(
      `SELECT id, name, email, role, created_at FROM users ${whereClause} ORDER BY name ASC`,
      params
    );

    return success(res, 200, 'Users fetched successfully.', rows);
  } catch (err) {
    console.error('getUsers error:', err);
    return failure(res, 500, 'Server error while fetching users.');
  }
}

module.exports = { getUsers };
