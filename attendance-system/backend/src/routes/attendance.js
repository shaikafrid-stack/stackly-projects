const express = require('express');
const pool = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');
const { computeTotalHours, computeStatus } = require('../utils/attendanceHelpers');

const router = express.Router();

function todayDateStr() {
  return new Date().toISOString().slice(0, 10);
}

// POST /api/attendance/checkin - employee marks check-in for today
router.post('/checkin', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const employeeId = req.user.id;
    const date = todayDateStr();

    const [existing] = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?',
      [employeeId, date]
    );
    if (existing.length > 0 && existing[0].check_in) {
      return res.status(400).json({ message: 'You have already checked in today.' });
    }

    const [userRows] = await pool.query('SELECT shift_id FROM users WHERE id = ?', [employeeId]);
    const shiftId = userRows[0]?.shift_id || null;

    const now = new Date();
    const checkInStr = now.toISOString().slice(0, 19).replace('T', ' ');

    let shiftStartTime = null;
    if (shiftId) {
      const [shiftRows] = await pool.query('SELECT start_time FROM shifts WHERE id = ?', [shiftId]);
      if (shiftRows.length > 0) shiftStartTime = shiftRows[0].start_time;
    }

    const status = computeStatus({ checkInTime: now, shiftStartTime });

    if (existing.length > 0) {
      await pool.query(
        'UPDATE attendance SET check_in = ?, shift_id = ?, status = ? WHERE id = ?',
        [checkInStr, shiftId, status, existing[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO attendance (employee_id, shift_id, attendance_date, check_in, status)
         VALUES (?, ?, ?, ?, ?)`,
        [employeeId, shiftId, date, checkInStr, status]
      );
    }

    res.status(201).json({ message: 'Checked in successfully.', check_in: checkInStr, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during check-in.' });
  }
});

// PUT /api/attendance/checkout - employee marks check-out for today
router.put('/checkout', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const employeeId = req.user.id;
    const date = todayDateStr();

    const [existing] = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?',
      [employeeId, date]
    );
    if (existing.length === 0 || !existing[0].check_in) {
      return res.status(400).json({ message: 'You must check in before checking out.' });
    }
    if (existing[0].check_out) {
      return res.status(400).json({ message: 'You have already checked out today.' });
    }

    const now = new Date();
    const checkOutStr = now.toISOString().slice(0, 19).replace('T', ' ');
    const totalHours = computeTotalHours(existing[0].check_in, now);

    let shiftStartTime = null;
    if (existing[0].shift_id) {
      const [shiftRows] = await pool.query('SELECT start_time FROM shifts WHERE id = ?', [existing[0].shift_id]);
      if (shiftRows.length > 0) shiftStartTime = shiftRows[0].start_time;
    }
    const status = computeStatus({ checkInTime: existing[0].check_in, shiftStartTime, totalHours });

    await pool.query(
      'UPDATE attendance SET check_out = ?, total_hours = ?, status = ? WHERE id = ?',
      [checkOutStr, totalHours, status, existing[0].id]
    );

    res.json({ message: 'Checked out successfully.', check_out: checkOutStr, total_hours: totalHours, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during check-out.' });
  }
});

// GET /api/attendance - list attendance records with role-based scope + filters
// Query params: employee_id, start_date, end_date, status, page, limit
router.get('/', verifyToken, async (req, res) => {
  try {
    const { employee_id, start_date, end_date, status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = ['1=1'];
    let params = [];

    if (req.user.role === 'employee') {
      where.push('a.employee_id = ?');
      params.push(req.user.id);
    } else if (req.user.role === 'manager') {
      where.push('u.manager_id = ?');
      params.push(req.user.id);
      if (employee_id) {
        where.push('a.employee_id = ?');
        params.push(employee_id);
      }
    } else if (req.user.role === 'admin') {
      if (employee_id) {
        where.push('a.employee_id = ?');
        params.push(employee_id);
      }
    }

    if (start_date) {
      where.push('a.attendance_date >= ?');
      params.push(start_date);
    }
    if (end_date) {
      where.push('a.attendance_date <= ?');
      params.push(end_date);
    }
    if (status) {
      where.push('a.status = ?');
      params.push(status);
    }

    const whereClause = where.join(' AND ');

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM attendance a JOIN users u ON a.employee_id = u.id WHERE ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT a.*, u.name AS employee_name, u.email AS employee_email, s.shift_name
       FROM attendance a
       JOIN users u ON a.employee_id = u.id
       LEFT JOIN shifts s ON a.shift_id = s.id
       WHERE ${whereClause}
       ORDER BY a.attendance_date DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching attendance.' });
  }
});

// GET /api/attendance/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT a.*, u.name AS employee_name, u.manager_id, s.shift_name
       FROM attendance a
       JOIN users u ON a.employee_id = u.id
       LEFT JOIN shifts s ON a.shift_id = s.id
       WHERE a.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Attendance record not found.' });

    const record = rows[0];
    if (req.user.role === 'employee' && record.employee_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden.' });
    }
    if (req.user.role === 'manager' && record.manager_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching attendance record.' });
  }
});

module.exports = router;
