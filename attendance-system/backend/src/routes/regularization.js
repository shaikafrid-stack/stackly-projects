const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');
const { computeTotalHours, computeStatus } = require('../utils/attendanceHelpers');

const router = express.Router();

// POST /api/regularization - employee applies for regularization
router.post(
  '/',
  verifyToken,
  requireRole('employee'),
  [
    body('attendance_id').isInt().withMessage('attendance_id is required'),
    body('reason').trim().notEmpty().withMessage('Reason is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { attendance_id, reason, requested_check_in, requested_check_out } = req.body;

    try {
      const [attRows] = await pool.query(
        'SELECT * FROM attendance WHERE id = ? AND employee_id = ?',
        [attendance_id, req.user.id]
      );
      if (attRows.length === 0) {
        return res.status(404).json({ message: 'Attendance record not found for this employee.' });
      }

      const [result] = await pool.query(
        `INSERT INTO regularization_requests (employee_id, attendance_id, reason, requested_check_in, requested_check_out)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, attendance_id, reason, requested_check_in || null, requested_check_out || null]
      );

      res.status(201).json({ message: 'Regularization request submitted.', id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error submitting regularization request.' });
    }
  }
);

// GET /api/regularization - list requests scoped by role
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = ['1=1'];
    let params = [];

    if (req.user.role === 'employee') {
      where.push('r.employee_id = ?');
      params.push(req.user.id);
    } else if (req.user.role === 'manager') {
      where.push('u.manager_id = ?');
      params.push(req.user.id);
    }
    // admin sees all

    if (status) {
      where.push('r.status = ?');
      params.push(status);
    }

    const whereClause = where.join(' AND ');

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM regularization_requests r JOIN users u ON r.employee_id = u.id WHERE ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT r.*, u.name AS employee_name, a.attendance_date, a.check_in, a.check_out, a.status AS attendance_status
       FROM regularization_requests r
       JOIN users u ON r.employee_id = u.id
       JOIN attendance a ON r.attendance_id = a.id
       WHERE ${whereClause}
       ORDER BY r.requested_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    res.json({ data: rows, total: countRows[0].total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching regularization requests.' });
  }
});

// PUT /api/regularization/:id/approve - manager/admin approves
router.put('/:id/approve', verifyToken, requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { manager_comments } = req.body;

    const [rows] = await pool.query(
      `SELECT r.*, u.manager_id, a.check_in AS current_check_in, a.shift_id
       FROM regularization_requests r
       JOIN users u ON r.employee_id = u.id
       JOIN attendance a ON r.attendance_id = a.id
       WHERE r.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Request not found.' });
    const request = rows[0];

    if (req.user.role === 'manager' && request.manager_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only approve requests from your own team.' });
    }
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'This request has already been resolved.' });
    }

    const newCheckIn = request.requested_check_in || request.current_check_in;
    const newCheckOut = request.requested_check_out;

    let totalHours = null;
    let status = 'Present';
    if (newCheckIn && newCheckOut) {
      totalHours = computeTotalHours(newCheckIn, newCheckOut);
      let shiftStartTime = null;
      if (request.shift_id) {
        const [shiftRows] = await pool.query('SELECT start_time FROM shifts WHERE id = ?', [request.shift_id]);
        if (shiftRows.length > 0) shiftStartTime = shiftRows[0].start_time;
      }
      status = computeStatus({ checkInTime: newCheckIn, shiftStartTime, totalHours });
    }

    await pool.query(
      `UPDATE attendance SET check_in = ?, check_out = ?, total_hours = ?, status = ? WHERE id = ?`,
      [newCheckIn, newCheckOut || null, totalHours, status, request.attendance_id]
    );

    await pool.query(
      `UPDATE regularization_requests SET status = 'Approved', manager_comments = ?, resolved_at = NOW() WHERE id = ?`,
      [manager_comments || null, id]
    );

    // Email notification simulation
    console.log(`[EMAIL SIMULATION] Regularization request #${id} approved. Notifying employee #${request.employee_id}.`);

    res.json({ message: 'Regularization request approved and attendance updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error approving request.' });
  }
});

// PUT /api/regularization/:id/reject - manager/admin rejects
router.put('/:id/reject', verifyToken, requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { manager_comments } = req.body;

    const [rows] = await pool.query(
      `SELECT r.*, u.manager_id FROM regularization_requests r JOIN users u ON r.employee_id = u.id WHERE r.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Request not found.' });
    const request = rows[0];

    if (req.user.role === 'manager' && request.manager_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only reject requests from your own team.' });
    }
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'This request has already been resolved.' });
    }

    await pool.query(
      `UPDATE regularization_requests SET status = 'Rejected', manager_comments = ?, resolved_at = NOW() WHERE id = ?`,
      [manager_comments || null, id]
    );

    console.log(`[EMAIL SIMULATION] Regularization request #${id} rejected. Notifying employee #${request.employee_id}.`);

    res.json({ message: 'Regularization request rejected.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error rejecting request.' });
  }
});

module.exports = router;
