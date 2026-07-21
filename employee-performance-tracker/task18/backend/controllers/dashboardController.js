const pool = require('../config/db');

exports.employeeDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const [[totals]] = await pool.query(
      `SELECT
        COUNT(*) AS total_goals,
        SUM(status = 'Completed') AS completed_goals,
        SUM(status != 'Completed') AS pending_goals
       FROM goals WHERE employee_id = ?`,
      [userId]
    );
    const [[ratingRow]] = await pool.query(
      `SELECT AVG(r.rating) AS avg_rating
       FROM performance_reviews r
       JOIN goals g ON r.goal_id = g.id
       WHERE g.employee_id = ? AND r.rating IS NOT NULL`,
      [userId]
    );
    const [recentGoals] = await pool.query(
      `SELECT id, title, status, priority, progress_percentage, target_date
       FROM goals WHERE employee_id = ? ORDER BY target_date ASC LIMIT 5`,
      [userId]
    );

    res.json({
      total_goals: totals.total_goals || 0,
      completed_goals: totals.completed_goals || 0,
      pending_goals: totals.pending_goals || 0,
      average_rating: ratingRow.avg_rating ? Number(ratingRow.avg_rating).toFixed(2) : null,
      recent_goals: recentGoals,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load employee dashboard', error: err.message });
  }
};

exports.managerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const [[totals]] = await pool.query(
      `SELECT
        COUNT(*) AS team_goals,
        SUM(status = 'Completed' AND approved = 0) AS pending_review,
        SUM(status = 'Completed') AS completed_goals
       FROM goals WHERE manager_id = ?`,
      [userId]
    );
    const [teamSummary] = await pool.query(
      `SELECT e.id AS employee_id, e.name AS employee_name,
        COUNT(g.id) AS total_goals,
        SUM(g.status = 'Completed') AS completed_goals,
        ROUND(AVG(g.progress_percentage), 1) AS avg_progress
       FROM users e
       LEFT JOIN goals g ON g.employee_id = e.id AND g.manager_id = ?
       WHERE e.manager_id = ?
       GROUP BY e.id, e.name`,
      [userId, userId]
    );

    res.json({
      team_goals: totals.team_goals || 0,
      goals_pending_review: totals.pending_review || 0,
      completed_goals: totals.completed_goals || 0,
      team_performance_summary: teamSummary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load manager dashboard', error: err.message });
  }
};

exports.adminDashboard = async (req, res) => {
  try {
    const [[userTotals]] = await pool.query(
      `SELECT COUNT(*) AS total_employees FROM users WHERE role = 'employee'`
    );
    const [[goalTotals]] = await pool.query(
      `SELECT COUNT(*) AS total_goals, SUM(status = 'Completed') AS completed_goals FROM goals`
    );
    const completionRate = goalTotals.total_goals
      ? ((goalTotals.completed_goals / goalTotals.total_goals) * 100).toFixed(1)
      : '0.0';

    const [[ratingRow]] = await pool.query(
      `SELECT AVG(rating) AS avg_rating FROM performance_reviews WHERE rating IS NOT NULL`
    );

    const [deptPerformance] = await pool.query(
      `SELECT u.department,
        COUNT(g.id) AS total_goals,
        SUM(g.status = 'Completed') AS completed_goals,
        ROUND(AVG(g.progress_percentage), 1) AS avg_progress,
        ROUND(AVG(r.rating), 2) AS avg_rating
       FROM users u
       LEFT JOIN goals g ON g.employee_id = u.id
       LEFT JOIN performance_reviews r ON r.goal_id = g.id
       WHERE u.role = 'employee'
       GROUP BY u.department`
    );

    res.json({
      total_employees: userTotals.total_employees || 0,
      goal_completion_rate: `${completionRate}%`,
      average_performance_rating: ratingRow.avg_rating ? Number(ratingRow.avg_rating).toFixed(2) : null,
      department_performance: deptPerformance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load admin dashboard', error: err.message });
  }
};
