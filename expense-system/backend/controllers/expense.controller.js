const pool = require('../config/db');

const VALID_CATEGORIES = ['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Client Entertainment', 'Software', 'Other'];

function validateExpensePayload(body) {
  const errors = [];
  if (!body.title || body.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long.');
  }
  if (!VALID_CATEGORIES.includes(body.category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}.`);
  }
  if (!body.amount || isNaN(body.amount) || Number(body.amount) <= 0) {
    errors.push('Amount must be a positive number.');
  }
  if (!body.expense_date || isNaN(Date.parse(body.expense_date))) {
    errors.push('A valid expense date is required.');
  } else if (new Date(body.expense_date) > new Date()) {
    errors.push('Expense date cannot be in the future.');
  }
  return errors;
}

// GET /api/expenses
// Employees see only their own; managers/admins see all (with optional filters)
async function getExpenses(req, res) {
  try {
    const { status, category, search, employee_id, sortBy, order, page = 1, limit = 10 } = req.query;
    const conditions = [];
    const params = [];

    if (req.user.role === 'employee') {
      conditions.push('e.employee_id = ?');
      params.push(req.user.id);
    } else if (employee_id) {
      conditions.push('e.employee_id = ?');
      params.push(employee_id);
    }

    if (status) {
      conditions.push('e.status = ?');
      params.push(status);
    }
    if (category) {
      conditions.push('e.category = ?');
      params.push(category);
    }
    if (search) {
      conditions.push('e.title LIKE ?');
      params.push(`%${search}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSort = ['expense_date', 'amount', 'created_at', 'title'];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'expense_date';
    const sortOrder = order && order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const offset = (pageNum - 1) * pageSize;

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM expenses e ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT e.*, u.name AS employee_name, u.email AS employee_email
       FROM expenses e
       JOIN users u ON u.id = e.employee_id
       ${whereClause}
       ORDER BY e.${sortColumn} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({
      data: rows,
      pagination: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ message: 'Something went wrong fetching expenses.' });
  }
}

// GET /api/expenses/:id
async function getExpenseById(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, u.name AS employee_name, u.email AS employee_email
       FROM expenses e JOIN users u ON u.id = e.employee_id WHERE e.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Expense not found.' });

    const expense = rows[0];
    if (req.user.role === 'employee' && expense.employee_id !== req.user.id) {
      return res.status(403).json({ message: 'You cannot view this expense.' });
    }
    res.json(expense);
  } catch (err) {
    console.error('Get expense error:', err);
    res.status(500).json({ message: 'Something went wrong fetching the expense.' });
  }
}

// POST /api/expenses (employee only)
async function createExpense(req, res) {
  try {
    const errors = validateExpensePayload(req.body);
    if (errors.length) return res.status(400).json({ message: 'Validation failed.', errors });

    const { title, category, amount, expense_date, description, receipt } = req.body;

    const [result] = await pool.query(
      `INSERT INTO expenses (employee_id, title, category, amount, expense_date, description, receipt, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [req.user.id, title.trim(), category, amount, expense_date, description || null, receipt || null]
    );

    const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Expense submitted successfully.', expense: rows[0] });
  } catch (err) {
    console.error('Create expense error:', err);
    res.status(500).json({ message: 'Something went wrong submitting the expense.' });
  }
}

// PUT /api/expenses/:id (employee only, own request, and only while Pending)
async function updateExpense(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Expense not found.' });

    const expense = rows[0];
    if (expense.employee_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own requests.' });
    }
    if (expense.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending requests can be edited.' });
    }

    const errors = validateExpensePayload(req.body);
    if (errors.length) return res.status(400).json({ message: 'Validation failed.', errors });

    const { title, category, amount, expense_date, description, receipt } = req.body;

    await pool.query(
      `UPDATE expenses SET title = ?, category = ?, amount = ?, expense_date = ?, description = ?, receipt = ?
       WHERE id = ?`,
      [title.trim(), category, amount, expense_date, description || null, receipt || null, req.params.id]
    );

    const [updated] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Expense updated successfully.', expense: updated[0] });
  } catch (err) {
    console.error('Update expense error:', err);
    res.status(500).json({ message: 'Something went wrong updating the expense.' });
  }
}

// DELETE /api/expenses/:id (employee only, own request, and only while Pending) - "Cancel"
async function deleteExpense(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Expense not found.' });

    const expense = rows[0];
    if (expense.employee_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only cancel your own requests.' });
    }
    if (expense.status !== 'Pending' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Only pending requests can be cancelled.' });
    }

    await pool.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Expense cancelled successfully.' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ message: 'Something went wrong cancelling the expense.' });
  }
}

// PUT /api/expenses/:id/approve (manager/admin only)
async function approveExpense(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Expense not found.' });
    if (rows[0].status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending requests can be approved.' });
    }

    await pool.query(
      `UPDATE expenses SET status = 'Approved', manager_comments = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
      [req.body.comments || null, req.user.id, req.params.id]
    );

    const [updated] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Expense approved.', expense: updated[0] });
  } catch (err) {
    console.error('Approve expense error:', err);
    res.status(500).json({ message: 'Something went wrong approving the expense.' });
  }
}

// PUT /api/expenses/:id/reject (manager/admin only)
async function rejectExpense(req, res) {
  try {
    if (!req.body.comments || !req.body.comments.trim()) {
      return res.status(400).json({ message: 'A comment is required when rejecting a request.' });
    }

    const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Expense not found.' });
    if (rows[0].status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending requests can be rejected.' });
    }

    await pool.query(
      `UPDATE expenses SET status = 'Rejected', manager_comments = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
      [req.body.comments, req.user.id, req.params.id]
    );

    const [updated] = await pool.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Expense rejected.', expense: updated[0] });
  } catch (err) {
    console.error('Reject expense error:', err);
    res.status(500).json({ message: 'Something went wrong rejecting the expense.' });
  }
}

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
};
