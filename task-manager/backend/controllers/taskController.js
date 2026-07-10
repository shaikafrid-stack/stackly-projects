const pool = require('../config/db');

const VALID_PRIORITIES = ['Low', 'Medium', 'High'];
const VALID_STATUSES = ['Pending', 'In Progress', 'Completed'];

// GET /api/tasks
// Supports query params: search, status, priority, sortBy=due_date, order=asc|desc
exports.getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, status, priority, sortBy, order } = req.query;

    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [userId];

    if (search) {
      query += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }
    if (status && VALID_STATUSES.includes(status)) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (priority && VALID_PRIORITIES.includes(priority)) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    const sortableColumns = ['due_date', 'created_at', 'priority', 'title'];
    const sortColumn = sortableColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order && order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    const [tasks] = await pool.query(query, params);

    // Dashboard-style summary counts (computed on the full task set, not the filtered one)
    const [summaryRows] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'Pending') AS pending,
         SUM(status = 'In Progress') AS inProgress,
         SUM(status = 'Completed') AS completed
       FROM tasks WHERE user_id = ?`,
      [userId]
    );

    res.json({
      tasks,
      summary: {
        total: Number(summaryRows[0].total) || 0,
        pending: Number(summaryRows[0].pending) || 0,
        inProgress: Number(summaryRows[0].inProgress) || 0,
        completed: Number(summaryRows[0].completed) || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
exports.getTaskById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, priority, due_date, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required.' });
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ message: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const [result] = await pool.query(
      `INSERT INTO tasks (title, description, priority, due_date, status, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description || null,
        priority || 'Medium',
        due_date || null,
        status || 'Pending',
        userId,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, priority, due_date, status } = req.body;

    const [existingRows] = await pool.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ message: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const existing = existingRows[0];

    await pool.query(
      `UPDATE tasks
       SET title = ?, description = ?, priority = ?, due_date = ?, status = ?
       WHERE id = ? AND user_id = ?`,
      [
        title !== undefined && title.trim() ? title.trim() : existing.title,
        description !== undefined ? description : existing.description,
        priority || existing.priority,
        due_date !== undefined ? due_date : existing.due_date,
        status || existing.status,
        id,
        userId,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
