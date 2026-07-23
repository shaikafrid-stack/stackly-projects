const express = require('express');
const pool = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

function todayDateStr() {
  return new Date().toISOString().slice(0, 10);
}
function firstDayOfMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

// GET /api/dashboard/employee
router.get('/employee', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = todayDateStr();
    const monthStart = firstDayOfMonthStr();

    const [todayRows] = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?',
      [employeeId, today]
    );

    const [monthRows] = await pool.query(
      `SELECT status, SUM(total_hours) AS hours, COUNT(*) AS cnt
       FROM attendance WHERE employee_id = ? AND attendance_date >= ?
       GROUP BY status`,
      [employeeId, monthStart]
    );

    let totalHoursMonth = 0;
    let presentDays = 0;
    let totalDays = 0;
    monthRows.forEach((r) => {
      totalHoursMonth += Number(r.hours) || 0;
      totalDays += r.cnt;
      if (r.status === 'Present' || r.status === 'Late') presentDays += r.cnt;
    });
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 10000) / 100 : 0;

    const [pendingReq] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM regularization_requests WHERE employee_id = ? AND status = 'Pending'`,
      [employeeId]
    );

    res.json({
      todays_attendance: todayRows[0] || null,
      total_working_hours_month: Math.round(totalHoursMonth * 100) / 100,
      attendance_percentage: attendancePercentage,
      pending_regularization_requests: pendingReq[0].cnt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching employee dashboard.' });
  }
});

// GET /api/dashboard/manager
router.get('/manager', verifyToken, requireRole('manager'), async (req, res) => {
  try {
    const managerId = req.user.id;
    const today = todayDateStr();

    const [teamCountRows] = await pool.query('SELECT COUNT(*) AS cnt FROM users WHERE manager_id = ?', [managerId]);
    const teamCount = teamCountRows[0].cnt;

    const [presentToday] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM attendance a JOIN users u ON a.employee_id = u.id
       WHERE u.manager_id = ? AND a.attendance_date = ? AND a.status IN ('Present','Late')`,
      [managerId, today]
    );

    const absentToday = teamCount - presentToday[0].cnt;

    const [lateToday] = await pool.query(
      `SELECT u.id, u.name, a.check_in FROM attendance a JOIN users u ON a.employee_id = u.id
       WHERE u.manager_id = ? AND a.attendance_date = ? AND a.status = 'Late'`,
      [managerId, today]
    );

    const [pendingApprovals] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM regularization_requests r JOIN users u ON r.employee_id = u.id
       WHERE u.manager_id = ? AND r.status = 'Pending'`,
      [managerId]
    );

    const [teamSummary] = await pool.query(
      `SELECT u.id, u.name, u.email,
              SUM(CASE WHEN a.status IN ('Present','Late') THEN 1 ELSE 0 END) AS present_days,
              SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS absent_days,
              SUM(CASE WHEN a.status = 'Half Day' THEN 1 ELSE 0 END) AS half_days
       FROM users u
       LEFT JOIN attendance a ON a.employee_id = u.id AND a.attendance_date >= DATE_SUB(?, INTERVAL 30 DAY)
       WHERE u.manager_id = ?
       GROUP BY u.id, u.name, u.email`,
      [today, managerId]
    );

    res.json({
      team_size: teamCount,
      employees_absent_today: absentToday < 0 ? 0 : absentToday,
      late_check_ins_today: lateToday,
      pending_approval_requests: pendingApprovals[0].cnt,
      team_attendance_summary: teamSummary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching manager dashboard.' });
  }
});

// GET /api/dashboard/admin
router.get('/admin', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const today = todayDateStr();
    const monthStart = firstDayOfMonthStr();

    const [totalEmployees] = await pool.query(`SELECT COUNT(*) AS cnt FROM users WHERE role = 'employee'`);

    const [attendanceStats] = await pool.query(
      `SELECT status, COUNT(*) AS cnt FROM attendance WHERE attendance_date = ? GROUP BY status`,
      [today]
    );
    let presentTodayCount = 0;
    attendanceStats.forEach((r) => {
      if (r.status === 'Present' || r.status === 'Late') presentTodayCount += r.cnt;
    });
    const attendancePercentageToday =
      totalEmployees[0].cnt > 0 ? Math.round((presentTodayCount / totalEmployees[0].cnt) * 10000) / 100 : 0;

    const [shiftUtilization] = await pool.query(
      `SELECT s.id, s.shift_name, COUNT(u.id) AS employees_assigned
       FROM shifts s LEFT JOIN users u ON u.shift_id = s.id
       GROUP BY s.id, s.shift_name`
    );

    const [monthlyTrends] = await pool.query(
      `SELECT attendance_date, 
              SUM(CASE WHEN status IN ('Present','Late') THEN 1 ELSE 0 END) AS present_count,
              SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
              SUM(CASE WHEN status = 'Half Day' THEN 1 ELSE 0 END) AS half_day_count
       FROM attendance
       WHERE attendance_date >= ?
       GROUP BY attendance_date
       ORDER BY attendance_date`,
      [monthStart]
    );

    res.json({
      total_employees: totalEmployees[0].cnt,
      attendance_percentage_today: attendancePercentageToday,
      shift_utilization: shiftUtilization,
      monthly_attendance_trends: monthlyTrends,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching admin dashboard.' });
  }
});

module.exports = router;
