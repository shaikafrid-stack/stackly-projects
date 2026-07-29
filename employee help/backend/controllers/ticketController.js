const pool = require('../config/db');

// Small helper to log a status/comment entry against a ticket
async function logTicketEvent(ticketId, userId, comment, status) {
  await pool.query(
    'INSERT INTO ticket_comments (ticket_id, user_id, comment, status_at_comment) VALUES (?, ?, ?, ?)',
    [ticketId, userId, comment, status || null]
  );
}

// GET /api/tickets  (role-aware, filterable, paginated)
exports.getTickets = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { search, category, priority, status, page = 1, limit = 10 } = req.query;

    const where = [];
    const params = [];

    if (role === 'employee') {
      where.push('t.employee_id = ?');
      params.push(userId);
    } else if (role === 'support_engineer') {
      where.push('t.assigned_engineer_id = ?');
      params.push(userId);
    }
    // admin: no restriction, sees all tickets

    if (search) {
      where.push('t.title LIKE ?');
      params.push(`%${search}%`);
    }
    if (category) {
      where.push('t.category = ?');
      params.push(category);
    }
    if (priority) {
      where.push('t.priority = ?');
      params.push(priority);
    }
    if (status) {
      where.push('t.status = ?');
      params.push(status);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const offset = (pageNum - 1) * pageSize;

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM tickets t ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT t.*, 
              e.name AS employee_name, 
              s.name AS engineer_name
       FROM tickets t
       LEFT JOIN users e ON e.id = t.employee_id
       LEFT JOIN users s ON s.id = t.assigned_engineer_id
       ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({
      data: rows,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (err) {
    console.error('Get tickets error:', err);
    res.status(500).json({ message: 'Server error while fetching tickets.' });
  }
};

// GET /api/tickets/:id
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    const [rows] = await pool.query(
      `SELECT t.*, e.name AS employee_name, s.name AS engineer_name
       FROM tickets t
       LEFT JOIN users e ON e.id = t.employee_id
       LEFT JOIN users s ON s.id = t.assigned_engineer_id
       WHERE t.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }
    const ticket = rows[0];

    if (role === 'employee' && ticket.employee_id !== userId) {
      return res.status(403).json({ message: 'You can only view your own tickets.' });
    }
    if (role === 'support_engineer' && ticket.assigned_engineer_id !== userId) {
      return res.status(403).json({ message: 'This ticket is not assigned to you.' });
    }

    const [history] = await pool.query(
      `SELECT c.*, u.name AS user_name, u.role AS user_role
       FROM ticket_comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.ticket_id = ?
       ORDER BY c.created_at ASC`,
      [id]
    );

    res.json({ ticket, history });
  } catch (err) {
    console.error('Get ticket by id error:', err);
    res.status(500).json({ message: 'Server error while fetching ticket.' });
  }
};

// POST /api/tickets  (employee creates)
exports.createTicket = async (req, res) => {
  try {
    const { title, description, category, priority, attachment_name } = req.body;

    if (!title || !description || !category || !priority) {
      return res.status(400).json({ message: 'Title, description, category and priority are required.' });
    }
    if (!['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ message: 'Priority must be Low, Medium, or High.' });
    }

    const [result] = await pool.query(
      `INSERT INTO tickets (employee_id, title, description, category, priority, status, attachment_name)
       VALUES (?, ?, ?, ?, ?, 'Open', ?)`,
      [req.user.id, title, description, category, priority, attachment_name || null]
    );

    await logTicketEvent(result.insertId, req.user.id, 'Ticket created.', 'Open');

    res.status(201).json({ message: 'Ticket created successfully.', ticketId: result.insertId });
  } catch (err) {
    console.error('Create ticket error:', err);
    res.status(500).json({ message: 'Server error while creating ticket.' });
  }
};

// PUT /api/tickets/:id  (update: status, reassignment, resolution notes, close, comment)
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;
    const { status, resolution_notes, assigned_engineer_id, comment, title, description, category, priority } = req.body;

    const [rows] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }
    const ticket = rows[0];

    // Authorization rules
    const isOwner = role === 'employee' && ticket.employee_id === userId;
    const isAssignedEngineer = role === 'support_engineer' && ticket.assigned_engineer_id === userId;
    const isAdmin = role === 'admin';

    if (!isOwner && !isAssignedEngineer && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to update this ticket.' });
    }

    const updates = [];
    const params = [];

    if (isOwner) {
      // Employees may only update/close their own OPEN tickets, or edit basic fields
      if (['Resolved', 'Closed'].includes(ticket.status) && status && status !== 'Closed') {
        return res.status(400).json({ message: 'Cannot reopen a resolved/closed ticket.' });
      }
      if (title) { updates.push('title = ?'); params.push(title); }
      if (description) { updates.push('description = ?'); params.push(description); }
      if (category) { updates.push('category = ?'); params.push(category); }
      if (priority) { updates.push('priority = ?'); params.push(priority); }
      if (status === 'Closed') { updates.push('status = ?'); params.push('Closed'); }
    }

    if (isAssignedEngineer || isAdmin) {
      if (status) {
        if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
          return res.status(400).json({ message: 'Invalid status value.' });
        }
        updates.push('status = ?'); params.push(status);
      }
      if (resolution_notes !== undefined) {
        updates.push('resolution_notes = ?'); params.push(resolution_notes);
      }
    }

    if (isAdmin && assigned_engineer_id !== undefined) {
      updates.push('assigned_engineer_id = ?'); params.push(assigned_engineer_id || null);
    }
    if ((isAssignedEngineer || isAdmin) && assigned_engineer_id !== undefined) {
      // Support engineers can reassign tickets to another engineer
      updates.push('assigned_engineer_id = ?'); params.push(assigned_engineer_id || null);
    }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    if (comment) {
      await logTicketEvent(id, userId, comment, status || ticket.status);
    } else if (status && status !== ticket.status) {
      await logTicketEvent(id, userId, `Status changed to ${status}.`, status);
    }

    res.json({ message: 'Ticket updated successfully.' });
  } catch (err) {
    console.error('Update ticket error:', err);
    res.status(500).json({ message: 'Server error while updating ticket.' });
  }
};

// DELETE /api/tickets/:id  (admin only, via route-level authorize)
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM tickets WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }
    res.json({ message: 'Ticket deleted successfully.' });
  } catch (err) {
    console.error('Delete ticket error:', err);
    res.status(500).json({ message: 'Server error while deleting ticket.' });
  }
};
