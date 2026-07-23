const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/shifts - all authenticated users can view shifts
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM shifts ORDER BY start_time');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching shifts.' });
  }
});

// POST /api/shifts - admin only
router.post(
  '/',
  verifyToken,
  requireRole('admin'),
  [
    body('shift_name').trim().notEmpty().withMessage('Shift name is required'),
    body('start_time').notEmpty().withMessage('Start time is required'),
    body('end_time').notEmpty().withMessage('End time is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { shift_name, start_time, end_time, grace_minutes } = req.body;
    try {
      const [result] = await pool.query(
        `INSERT INTO shifts (shift_name, start_time, end_time, grace_minutes) VALUES (?, ?, ?, ?)`,
        [shift_name, start_time, end_time, grace_minutes ?? 15]
      );
      res.status(201).json({ id: result.insertId, shift_name, start_time, end_time, grace_minutes: grace_minutes ?? 15 });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error creating shift.' });
    }
  }
);

// PUT /api/shifts/:id - admin only
router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { shift_name, start_time, end_time, grace_minutes } = req.body;
  try {
    const [existing] = await pool.query('SELECT * FROM shifts WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Shift not found.' });

    await pool.query(
      `UPDATE shifts SET shift_name = ?, start_time = ?, end_time = ?, grace_minutes = ? WHERE id = ?`,
      [
        shift_name ?? existing[0].shift_name,
        start_time ?? existing[0].start_time,
        end_time ?? existing[0].end_time,
        grace_minutes ?? existing[0].grace_minutes,
        id,
      ]
    );
    res.json({ message: 'Shift updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating shift.' });
  }
});

// DELETE /api/shifts/:id - admin only
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.query('SELECT * FROM shifts WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Shift not found.' });

    await pool.query('DELETE FROM shifts WHERE id = ?', [id]);
    res.json({ message: 'Shift deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting shift.' });
  }
});

// PUT /api/shifts/assign/:userId - manager/admin assign a shift to an employee
router.put('/assign/:userId', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  const { userId } = req.params;
  const { shift_id } = req.body;
  try {
    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (user.length === 0) return res.status(404).json({ message: 'Employee not found.' });

    // Managers can only assign shifts to their own team
    if (req.user.role === 'manager' && user[0].manager_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only assign shifts to your own team members.' });
    }

    await pool.query('UPDATE users SET shift_id = ? WHERE id = ?', [shift_id, userId]);
    res.json({ message: 'Shift assigned successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error assigning shift.' });
  }
});

module.exports = router;
