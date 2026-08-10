const pool = require('../config/db');

async function getActivity(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, u.name AS user_name
       FROM dataset_activity a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.dataset_id = ?
       ORDER BY a.activity_time DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching activity log.' });
  }
}

module.exports = { getActivity };
