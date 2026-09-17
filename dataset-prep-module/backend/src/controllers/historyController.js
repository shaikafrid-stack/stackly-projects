const pool = require('../config/db');

// GET /api/datasets/:id/history  (also supports GET /api/history for global view)
async function getHistory(req, res, next) {
  try {
    const { search = '', type = '', status = '', page = 1, limit = 10 } = req.query;
    const datasetId = req.params.id;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    const where = [];
    const params = [];
    if (datasetId) {
      where.push('h.dataset_id = ?');
      params.push(datasetId);
    }
    if (type) {
      where.push('t.transformation_type = ?');
      params.push(type);
    }
    if (status) {
      where.push('h.status = ?');
      params.push(status);
    }
    if (search) {
      where.push('(d.name LIKE ? OR v.version_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT h.*, d.name AS dataset_name, v.version_name, v.version_number,
              t.transformation_type, t.column_name, u.name AS performed_by_name
       FROM transformation_history h
       LEFT JOIN datasets d ON d.id = h.dataset_id
       LEFT JOIN dataset_versions v ON v.id = h.version_id
       LEFT JOIN transformations t ON t.id = h.transformation_id
       LEFT JOIN users u ON u.id = h.performed_by
       ${whereClause}
       ORDER BY h.executed_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM transformation_history h
       LEFT JOIN datasets d ON d.id = h.dataset_id
       LEFT JOIN dataset_versions v ON v.id = h.version_id
       LEFT JOIN transformations t ON t.id = h.transformation_id
       ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: rows,
      pagination: { total, page: parseInt(page, 10), limit: parseInt(limit, 10), totalPages: Math.ceil(total / limit) || 1 }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getHistory };
