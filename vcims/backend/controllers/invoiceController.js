const pool = require('../config/db');
const { getVendorIdForUser } = require('./contractController');

// GET /api/invoices  (vendor: own invoices only; finance/admin: all)
// supports ?search=&approval_status=&payment_status=&page=&limit=
exports.getInvoices = async (req, res, next) => {
  try {
    const { search = '', approval_status = '', payment_status = '', page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = ' WHERE 1=1 ';
    const params = [];

    if (req.user.role === 'vendor') {
      const vendorId = await getVendorIdForUser(req.user.id);
      where += ' AND i.vendor_id = ? ';
      params.push(vendorId);
    }
    if (search) {
      where += ' AND (i.invoice_number LIKE ? OR v.vendor_name LIKE ?) ';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (approval_status) {
      where += ' AND i.approval_status = ? ';
      params.push(approval_status);
    }
    if (payment_status) {
      where += ' AND i.payment_status = ? ';
      params.push(payment_status);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM invoices i
       JOIN vendors v ON i.vendor_id = v.id ${where}`,
      params
    );
    const [rows] = await pool.query(
      `SELECT i.*, v.vendor_name, c.contract_title
       FROM invoices i
       JOIN vendors v ON i.vendor_id = v.id
       JOIN contracts c ON i.contract_id = c.id
       ${where} ORDER BY i.created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    res.json({
      data: rows,
      pagination: {
        total: countRows[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countRows[0].total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/invoices/:id
exports.getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT i.*, v.vendor_name, c.contract_title
       FROM invoices i
       JOIN vendors v ON i.vendor_id = v.id
       JOIN contracts c ON i.contract_id = c.id
       WHERE i.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Invoice not found.' });

    // vendors may only view their own invoice
    if (req.user.role === 'vendor') {
      const vendorId = await getVendorIdForUser(req.user.id);
      if (rows[0].vendor_id !== vendorId) {
        return res.status(403).json({ message: 'Access denied.' });
      }
    }

    const [comments] = await pool.query(
      `SELECT ic.*, u.name AS user_name, u.role AS user_role
       FROM invoice_comments ic JOIN users u ON ic.user_id = u.id
       WHERE ic.invoice_id = ? ORDER BY ic.created_at ASC`,
      [id]
    );
    const [payments] = await pool.query('SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC', [id]);

    res.json({ invoice: rows[0], comments, payments });
  } catch (err) {
    next(err);
  }
};

// POST /api/invoices  (vendor only - upload invoice)
exports.createInvoice = async (req, res, next) => {
  try {
    const { contract_id, invoice_number, invoice_amount, invoice_date, due_date } = req.body;
    if (!contract_id || !invoice_number || !invoice_amount || !invoice_date || !due_date) {
      return res.status(400).json({ message: 'contract_id, invoice_number, invoice_amount, invoice_date, due_date are required.' });
    }

    const vendorId = await getVendorIdForUser(req.user.id);
    if (!vendorId) return res.status(400).json({ message: 'No vendor profile linked to this user.' });

    // ensure the contract belongs to this vendor
    const [contractRows] = await pool.query('SELECT * FROM contracts WHERE id = ? AND vendor_id = ?', [contract_id, vendorId]);
    if (contractRows.length === 0) {
      return res.status(403).json({ message: 'Contract does not belong to this vendor.' });
    }

    const fileName = req.file ? req.file.filename : (req.body.file_name || null);

    const [result] = await pool.query(
      `INSERT INTO invoices (vendor_id, contract_id, invoice_number, invoice_amount, invoice_date, due_date, payment_status, approval_status, file_name)
       VALUES (?, ?, ?, ?, ?, ?, 'Unpaid', 'Pending', ?)`,
      [vendorId, contract_id, invoice_number, invoice_amount, invoice_date, due_date, fileName]
    );
    const [rows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Invoice submitted.', invoice: rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/invoices/:id  (vendor can edit own pending invoice; admin/finance can edit any)
exports.updateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Invoice not found.' });

    if (req.user.role === 'vendor') {
      const vendorId = await getVendorIdForUser(req.user.id);
      if (existing[0].vendor_id !== vendorId) return res.status(403).json({ message: 'Access denied.' });
      if (existing[0].approval_status !== 'Pending') {
        return res.status(400).json({ message: 'Only pending invoices can be edited.' });
      }
    }

    const { invoice_number, invoice_amount, invoice_date, due_date } = req.body;
    await pool.query(
      `UPDATE invoices SET invoice_number = ?, invoice_amount = ?, invoice_date = ?, due_date = ? WHERE id = ?`,
      [
        invoice_number ?? existing[0].invoice_number,
        invoice_amount ?? existing[0].invoice_amount,
        invoice_date ?? existing[0].invoice_date,
        due_date ?? existing[0].due_date,
        id,
      ]
    );
    const [rows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
    res.json({ message: 'Invoice updated.', invoice: rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/invoices/:id  (admin only, or vendor if pending)
exports.deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Invoice not found.' });

    if (req.user.role === 'vendor') {
      const vendorId = await getVendorIdForUser(req.user.id);
      if (existing[0].vendor_id !== vendorId) return res.status(403).json({ message: 'Access denied.' });
      if (existing[0].approval_status !== 'Pending') {
        return res.status(400).json({ message: 'Only pending invoices can be deleted.' });
      }
    }

    await pool.query('DELETE FROM invoices WHERE id = ?', [id]);
    res.json({ message: 'Invoice deleted.' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/invoices/:id/approve  (finance_manager / admin only)
exports.approveInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const [existing] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Invoice not found.' });
    if (existing[0].approval_status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending invoices can be approved.' });
    }

    await pool.query(`UPDATE invoices SET approval_status = 'Approved' WHERE id = ?`, [id]);
    if (comment) {
      await pool.query(
        `INSERT INTO invoice_comments (invoice_id, user_id, comment) VALUES (?, ?, ?)`,
        [id, req.user.id, comment]
      );
    }
    const [rows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
    res.json({ message: 'Invoice approved.', invoice: rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/invoices/:id/reject  (finance_manager / admin only)
exports.rejectInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const [existing] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Invoice not found.' });
    if (existing[0].approval_status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending invoices can be rejected.' });
    }

    await pool.query(`UPDATE invoices SET approval_status = 'Rejected' WHERE id = ?`, [id]);
    if (comment) {
      await pool.query(
        `INSERT INTO invoice_comments (invoice_id, user_id, comment) VALUES (?, ?, ?)`,
        [id, req.user.id, comment]
      );
    }
    const [rows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
    res.json({ message: 'Invoice rejected.', invoice: rows[0] });
  } catch (err) {
    next(err);
  }
};
