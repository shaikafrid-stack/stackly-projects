const pool = require('../config/db');

// GET /api/dashboard/employee
exports.employeeDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM tickets WHERE employee_id = ?', [userId]
    );
    const [[{ open }]] = await pool.query(
      `SELECT COUNT(*) AS open FROM tickets WHERE employee_id = ? AND status IN ('Open','In Progress')`,
      [userId]
    );
    const [[{ closed }]] = await pool.query(
      `SELECT COUNT(*) AS closed FROM tickets WHERE employee_id = ? AND status IN ('Resolved','Closed')`,
      [userId]
    );
    const [recent] = await pool.query(
      `SELECT id, title, status, priority, updated_at FROM tickets
       WHERE employee_id = ? ORDER BY updated_at DESC LIMIT 5`,
      [userId]
    );

    res.json({ totalTickets: total, openTickets: open, closedTickets: closed, recentlyUpdated: recent });
  } catch (err) {
    console.error('Employee dashboard error:', err);
    res.status(500).json({ message: 'Server error while loading dashboard.' });
  }
};

// GET /api/dashboard/support
exports.supportDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [[{ assigned }]] = await pool.query(
      'SELECT COUNT(*) AS assigned FROM tickets WHERE assigned_engineer_id = ?', [userId]
    );
    const [[{ resolved }]] = await pool.query(
      `SELECT COUNT(*) AS resolved FROM tickets WHERE assigned_engineer_id = ? AND status IN ('Resolved','Closed')`,
      [userId]
    );
    const [[{ pending }]] = await pool.query(
      `SELECT COUNT(*) AS pending FROM tickets WHERE assigned_engineer_id = ? AND status IN ('Open','In Progress')`,
      [userId]
    );
    const [[{ avgHours }]] = await pool.query(
      `SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) AS avgHours
       FROM tickets WHERE assigned_engineer_id = ? AND status IN ('Resolved','Closed')`,
      [userId]
    );

    res.json({
      assignedTickets: assigned,
      resolvedTickets: resolved,
      pendingTickets: pending,
      avgResolutionTimeHours: avgHours ? Math.round(avgHours * 10) / 10 : 0,
    });
  } catch (err) {
    console.error('Support dashboard error:', err);
    res.status(500).json({ message: 'Server error while loading dashboard.' });
  }
};

// GET /api/dashboard/admin
exports.adminDashboard = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalTickets }]] = await pool.query('SELECT COUNT(*) AS totalTickets FROM tickets');
    const [[{ totalArticles }]] = await pool.query('SELECT COUNT(*) AS totalArticles FROM knowledge_base');

    const [byStatus] = await pool.query(
      'SELECT status, COUNT(*) AS count FROM tickets GROUP BY status'
    );
    const [byPriority] = await pool.query(
      'SELECT priority, COUNT(*) AS count FROM tickets GROUP BY priority'
    );
    const [monthlyTrend] = await pool.query(
      `SELECT DATE_FORMAT(updated_at, '%Y-%m') AS month, COUNT(*) AS resolvedCount
       FROM tickets
       WHERE status IN ('Resolved', 'Closed')
       GROUP BY DATE_FORMAT(updated_at, '%Y-%m')
       ORDER BY month ASC
       LIMIT 12`
    );

    res.json({
      totalUsers,
      totalTickets,
      totalArticles,
      ticketsByStatus: byStatus,
      ticketsByPriority: byPriority,
      monthlyResolutionTrend: monthlyTrend,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ message: 'Server error while loading dashboard.' });
  }
};
