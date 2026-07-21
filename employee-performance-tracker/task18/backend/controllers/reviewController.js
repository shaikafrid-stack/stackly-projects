const pool = require('../config/db');

/**
 * POST /api/reviews
 * Managers add manager_comments + rating for a goal they own (must be Completed).
 * Employees add employee_comments (self-review) for their own goal.
 */
exports.createReview = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { goal_id, manager_comments, employee_comments, rating } = req.body;

    const [goalRows] = await pool.query('SELECT * FROM goals WHERE id = ?', [goal_id]);
    if (!goalRows.length) return res.status(404).json({ message: 'Goal not found' });
    const goal = goalRows[0];

    if (role === 'manager') {
      if (goal.manager_id !== userId) {
        return res.status(403).json({ message: 'You can only review goals for your team' });
      }
      if (goal.status !== 'Completed') {
        return res.status(400).json({ message: 'Only completed goals can be reviewed' });
      }
      if (!manager_comments || manager_comments.trim().length < 5) {
        return res.status(400).json({ message: 'Manager comments must be at least 5 characters' });
      }
      if (rating === undefined || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
    } else if (role === 'employee') {
      if (goal.employee_id !== userId) {
        return res.status(403).json({ message: 'You can only self-review your own goals' });
      }
      if (!employee_comments || employee_comments.trim().length < 5) {
        return res.status(400).json({ message: 'Self-review comments must be at least 5 characters' });
      }
    } else if (role !== 'admin') {
      return res.status(403).json({ message: 'Not permitted' });
    }

    // If a review already exists for this goal, update it; otherwise create.
    const [existing] = await pool.query('SELECT * FROM performance_reviews WHERE goal_id = ?', [goal_id]);

    if (existing.length) {
      const fields = [];
      const params = [];
      if (manager_comments !== undefined) { fields.push('manager_comments = ?'); params.push(manager_comments); }
      if (employee_comments !== undefined) { fields.push('employee_comments = ?'); params.push(employee_comments); }
      if (rating !== undefined) { fields.push('rating = ?'); params.push(rating); }
      params.push(goal_id);
      await pool.query(`UPDATE performance_reviews SET ${fields.join(', ')} WHERE goal_id = ?`, params);
      const [updated] = await pool.query('SELECT * FROM performance_reviews WHERE goal_id = ?', [goal_id]);
      return res.json(updated[0]);
    }

    const [result] = await pool.query(
      `INSERT INTO performance_reviews (goal_id, manager_comments, employee_comments, rating, review_date)
       VALUES (?, ?, ?, ?, CURRENT_DATE)`,
      [goal_id, manager_comments || null, employee_comments || null, rating || null]
    );
    const [created] = await pool.query('SELECT * FROM performance_reviews WHERE id = ?', [result.insertId]);
    res.status(201).json(created[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit review', error: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { goal_id } = req.query;

    const conditions = [];
    const params = [];

    if (role === 'employee') {
      conditions.push('g.employee_id = ?');
      params.push(userId);
    } else if (role === 'manager') {
      conditions.push('g.manager_id = ?');
      params.push(userId);
    }
    if (goal_id) {
      conditions.push('r.goal_id = ?');
      params.push(goal_id);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT r.*, g.title AS goal_title, g.employee_id, g.manager_id
       FROM performance_reviews r
       JOIN goals g ON r.goal_id = g.id
       ${whereClause}
       ORDER BY r.review_date DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const [rows] = await pool.query(
      `SELECT r.*, g.manager_id, g.employee_id FROM performance_reviews r
       JOIN goals g ON r.goal_id = g.id WHERE r.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Review not found' });
    const review = rows[0];

    const fields = [];
    const params = [];

    if (role === 'manager') {
      if (review.manager_id !== userId) return res.status(403).json({ message: 'Not permitted' });
      const { manager_comments, rating } = req.body;
      if (manager_comments !== undefined) { fields.push('manager_comments = ?'); params.push(manager_comments); }
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        fields.push('rating = ?'); params.push(rating);
      }
    } else if (role === 'employee') {
      if (review.employee_id !== userId) return res.status(403).json({ message: 'Not permitted' });
      const { employee_comments } = req.body;
      if (employee_comments !== undefined) { fields.push('employee_comments = ?'); params.push(employee_comments); }
    } else if (role === 'admin') {
      const { manager_comments, employee_comments, rating } = req.body;
      if (manager_comments !== undefined) { fields.push('manager_comments = ?'); params.push(manager_comments); }
      if (employee_comments !== undefined) { fields.push('employee_comments = ?'); params.push(employee_comments); }
      if (rating !== undefined) { fields.push('rating = ?'); params.push(rating); }
    }

    if (!fields.length) return res.status(400).json({ message: 'No valid fields to update' });

    params.push(req.params.id);
    await pool.query(`UPDATE performance_reviews SET ${fields.join(', ')} WHERE id = ?`, params);
    const [updated] = await pool.query('SELECT * FROM performance_reviews WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update review', error: err.message });
  }
};
