const pool = require('../config/db');

/**
 * GET /api/goals
 * Employees see only their own goals.
 * Managers see goals for employees they manage.
 * Admins see all goals.
 * Supports: search (title), status, priority, sortBy target_date, pagination.
 */
exports.getGoals = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const {
      search = '',
      status,
      priority,
      sort = 'target_date',
      order = 'asc',
      page = 1,
      limit = 10,
    } = req.query;

    const allowedSort = ['target_date', 'created_at', 'priority', 'progress_percentage', 'title'];
    const sortCol = allowedSort.includes(sort) ? sort : 'target_date';
    const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const conditions = [];
    const params = [];

    if (role === 'employee') {
      conditions.push('g.employee_id = ?');
      params.push(userId);
    } else if (role === 'manager') {
      conditions.push('g.manager_id = ?');
      params.push(userId);
    }
    // admin: no restriction

    if (search) {
      conditions.push('g.title LIKE ?');
      params.push(`%${search}%`);
    }
    if (status) {
      conditions.push('g.status = ?');
      params.push(status);
    }
    if (priority) {
      conditions.push('g.priority = ?');
      params.push(priority);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM goals g ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT g.*, e.name AS employee_name, m.name AS manager_name
       FROM goals g
       JOIN users e ON g.employee_id = e.id
       JOIN users m ON g.manager_id = m.id
       ${whereClause}
       ORDER BY g.${sortCol} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      data: rows,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch goals', error: err.message });
  }
};

exports.getGoalById = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const [rows] = await pool.query(
      `SELECT g.*, e.name AS employee_name, m.name AS manager_name
       FROM goals g
       JOIN users e ON g.employee_id = e.id
       JOIN users m ON g.manager_id = m.id
       WHERE g.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Goal not found' });

    const goal = rows[0];
    if (role === 'employee' && goal.employee_id !== userId) {
      return res.status(403).json({ message: 'You cannot view this goal' });
    }
    if (role === 'manager' && goal.manager_id !== userId) {
      return res.status(403).json({ message: 'You cannot view this goal' });
    }

    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch goal', error: err.message });
  }
};

/**
 * POST /api/goals
 * Employees create goals for themselves (manager assigned automatically).
 * Managers create goals for a chosen employee they manage.
 * Admins can create a goal for any employee/manager pair.
 */
exports.createGoal = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let { employee_id, manager_id, title, description, priority, target_date } = req.body;

    if (role === 'employee') {
      employee_id = userId;
      const [me] = await pool.query('SELECT manager_id FROM users WHERE id = ?', [userId]);
      if (!me.length || !me[0].manager_id) {
        return res.status(400).json({ message: 'You have no assigned manager. Contact an admin.' });
      }
      manager_id = me[0].manager_id;
    } else if (role === 'manager') {
      manager_id = userId;
      const [emp] = await pool.query(
        'SELECT id FROM users WHERE id = ? AND manager_id = ? AND role = "employee"',
        [employee_id, userId]
      );
      if (!emp.length) {
        return res.status(403).json({ message: 'You can only assign goals to your own team members' });
      }
    } else if (role === 'admin') {
      const [emp] = await pool.query('SELECT id FROM users WHERE id = ?', [employee_id]);
      const [mgr] = await pool.query('SELECT id FROM users WHERE id = ?', [manager_id]);
      if (!emp.length || !mgr.length) {
        return res.status(400).json({ message: 'Invalid employee_id or manager_id' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO goals (employee_id, manager_id, title, description, priority, target_date, progress_percentage, status)
       VALUES (?, ?, ?, ?, ?, ?, 0, 'Not Started')`,
      [employee_id, manager_id, title, description || '', priority || 'Medium', target_date]
    );

    const [rows] = await pool.query('SELECT * FROM goals WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create goal', error: err.message });
  }
};

/**
 * PUT /api/goals/:id
 * Employees may only update progress_percentage / status on their own goal.
 * Managers may update title/description/priority/target_date/approved on goals they own.
 * Admins may update anything.
 */
exports.updateGoal = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const [existingRows] = await pool.query('SELECT * FROM goals WHERE id = ?', [req.params.id]);
    if (!existingRows.length) return res.status(404).json({ message: 'Goal not found' });
    const goal = existingRows[0];

    const fields = [];
    const params = [];

    if (role === 'employee') {
      if (goal.employee_id !== userId) {
        return res.status(403).json({ message: 'You can only update your own goals' });
      }
      const { progress_percentage, status } = req.body;
      if (progress_percentage !== undefined) {
        if (progress_percentage < 0 || progress_percentage > 100) {
          return res.status(400).json({ message: 'progress_percentage must be between 0 and 100' });
        }
        fields.push('progress_percentage = ?');
        params.push(progress_percentage);
      }
      if (status !== undefined) {
        fields.push('status = ?');
        params.push(status);
      }
    } else if (role === 'manager') {
      if (goal.manager_id !== userId) {
        return res.status(403).json({ message: 'You can only update goals for your team' });
      }
      const { title, description, priority, target_date, approved, status } = req.body;
      if (title !== undefined) { fields.push('title = ?'); params.push(title); }
      if (description !== undefined) { fields.push('description = ?'); params.push(description); }
      if (priority !== undefined) { fields.push('priority = ?'); params.push(priority); }
      if (target_date !== undefined) { fields.push('target_date = ?'); params.push(target_date); }
      if (status !== undefined) { fields.push('status = ?'); params.push(status); }
      if (approved !== undefined) {
        if (goal.status !== 'Completed' && approved) {
          return res.status(400).json({ message: 'Only completed goals can be approved' });
        }
        fields.push('approved = ?');
        params.push(approved ? 1 : 0);
      }
    } else if (role === 'admin') {
      const allowed = ['title', 'description', 'priority', 'target_date', 'progress_percentage', 'status', 'approved', 'employee_id', 'manager_id'];
      allowed.forEach((key) => {
        if (req.body[key] !== undefined) {
          fields.push(`${key} = ?`);
          params.push(req.body[key]);
        }
      });
    }

    if (!fields.length) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    params.push(req.params.id);
    await pool.query(`UPDATE goals SET ${fields.join(', ')} WHERE id = ?`, params);

    const [updated] = await pool.query('SELECT * FROM goals WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update goal', error: err.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const [rows] = await pool.query('SELECT * FROM goals WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Goal not found' });
    const goal = rows[0];

    if (role === 'employee') {
      return res.status(403).json({ message: 'Employees cannot delete goals' });
    }
    if (role === 'manager' && goal.manager_id !== userId) {
      return res.status(403).json({ message: 'You can only delete goals for your team' });
    }

    await pool.query('DELETE FROM goals WHERE id = ?', [req.params.id]);
    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete goal', error: err.message });
  }
};
