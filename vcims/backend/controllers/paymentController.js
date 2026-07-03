const pool = require('../config/db');

// POST /api/payments  (finance_manager / admin only)
// Records a payment against an invoice, validates amount, and updates payment_status
exports.createPayment = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { invoice_id, payment_amount, payment_date, payment_mode, transaction_reference } = req.body;
    if (!invoice_id || !payment_amount || !payment_date) {
      conn.release();
      return res.status(400).json({ message: 'invoice_id, payment_amount, payment_date are required.' });
    }

    const [invRows] = await conn.query('SELECT * FROM invoices WHERE id = ?', [invoice_id]);
    if (invRows.length === 0) {
      conn.release();
      return res.status(404).json({ message: 'Invoice not found.' });
    }
    const invoice = invRows[0];

    // Business rule: cannot pay an invoice that hasn't been approved
    if (invoice.approval_status !== 'Approved') {
      conn.release();
      return res.status(400).json({ message: 'Only approved invoices can be marked as paid.' });
    }

    const [paidRows] = await conn.query(
      'SELECT COALESCE(SUM(payment_amount), 0) AS total_paid FROM payments WHERE invoice_id = ?',
      [invoice_id]
    );
    const alreadyPaid = Number(paidRows[0].total_paid);
    const newTotal = alreadyPaid + Number(payment_amount);

    // Validation: payment amount cannot exceed remaining balance
    if (newTotal > Number(invoice.invoice_amount)) {
      conn.release();
      return res.status(400).json({
        message: `Payment exceeds invoice balance. Remaining balance: ${(Number(invoice.invoice_amount) - alreadyPaid).toFixed(2)}`,
      });
    }

    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO payments (invoice_id, payment_amount, payment_date, payment_mode, transaction_reference)
       VALUES (?, ?, ?, ?, ?)`,
      [invoice_id, payment_amount, payment_date, payment_mode || 'Bank Transfer', transaction_reference || null]
    );

    const newStatus = newTotal >= Number(invoice.invoice_amount) ? 'Paid' : 'Partially Paid';
    await conn.query('UPDATE invoices SET payment_status = ? WHERE id = ?', [newStatus, invoice_id]);

    await conn.commit();

    const [updatedInvoice] = await conn.query('SELECT * FROM invoices WHERE id = ?', [invoice_id]);
    res.status(201).json({ message: 'Payment recorded.', invoice: updatedInvoice[0] });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

// GET /api/payments  (finance_manager / admin see all; vendor sees own via invoice join)
exports.getPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, invoice_id } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = ' WHERE 1=1 ';
    const params = [];

    if (req.user.role === 'vendor') {
      where += ' AND v.user_id = ? ';
      params.push(req.user.id);
    }
    if (invoice_id) {
      where += ' AND p.invoice_id = ? ';
      params.push(invoice_id);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM payments p
       JOIN invoices i ON p.invoice_id = i.id
       JOIN vendors v ON i.vendor_id = v.id ${where}`,
      params
    );
    const [rows] = await pool.query(
      `SELECT p.*, i.invoice_number, v.vendor_name
       FROM payments p
       JOIN invoices i ON p.invoice_id = i.id
       JOIN vendors v ON i.vendor_id = v.id
       ${where} ORDER BY p.payment_date DESC LIMIT ? OFFSET ?`,
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
