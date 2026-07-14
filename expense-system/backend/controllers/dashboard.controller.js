const pool = require('../config/db');

async function getSummary(whereClause, params) {
  const [totals] = await pool.query(
    `SELECT
       COUNT(*) AS totalSubmitted,
       SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
       SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected,
       COALESCE(SUM(CASE WHEN status = 'Approved' THEN amount ELSE 0 END), 0) AS totalReimbursed
     FROM expenses ${whereClause}`,
    params
  );
  return totals[0];
}

// GET /api/dashboard/employee
async function employeeDashboard(req, res) {
  try {
    const summary = await getSummary('WHERE employee_id = ?', [req.user.id]);
    const [recent] = await pool.query(
      'SELECT * FROM expenses WHERE employee_id = ? ORDER BY created_at DESC LIMIT 5',
      [req.user.id]
    );
    res.json({ summary, recent });
  } catch (err) {
    console.error('Employee dashboard error:', err);
    res.status(500).json({ message: 'Something went wrong loading the dashboard.' });
  }
}

// GET /api/dashboard/manager
async function managerDashboard(req, res) {
  try {
    const summary = await getSummary('', []);
    const [pendingList] = await pool.query(
      `SELECT e.*, u.name AS employee_name FROM expenses e
       JOIN users u ON u.id = e.employee_id
       WHERE e.status = 'Pending' ORDER BY e.created_at DESC LIMIT 10`
    );
    res.json({ summary, pendingList });
  } catch (err) {
    console.error('Manager dashboard error:', err);
    res.status(500).json({ message: 'Something went wrong loading the dashboard.' });
  }
}

// GET /api/dashboard/admin
async function adminDashboard(req, res) {
  try {
    const summary = await getSummary('', []);

    const [byCategory] = await pool.query(
      `SELECT category, COUNT(*) AS count, COALESCE(SUM(amount),0) AS total
       FROM expenses GROUP BY category ORDER BY total DESC`
    );

    const [monthly] = await pool.query(
      `SELECT DATE_FORMAT(expense_date, '%Y-%m') AS month,
              COUNT(*) AS count,
              COALESCE(SUM(CASE WHEN status = 'Approved' THEN amount ELSE 0 END), 0) AS totalReimbursed
       FROM expenses GROUP BY month ORDER BY month DESC LIMIT 12`
    );

    const [userCounts] = await pool.query(
      `SELECT role, COUNT(*) AS count FROM users GROUP BY role`
    );

    res.json({ summary, byCategory, monthly, userCounts });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ message: 'Something went wrong loading the dashboard.' });
  }
}

module.exports = { employeeDashboard, managerDashboard, adminDashboard };
