const pool = require('../config/db');
const { getVendorIdForUser } = require('./contractController');

// GET /api/dashboard/admin  (admin only)
exports.adminDashboard = async (req, res, next) => {
  try {
    const [[vendorCount]] = await pool.query('SELECT COUNT(*) AS count FROM vendors');
    const [[contractCount]] = await pool.query('SELECT COUNT(*) AS count FROM contracts');
    const [[invoiceCount]] = await pool.query('SELECT COUNT(*) AS count FROM invoices');
    const [[totalPaid]] = await pool.query(`SELECT COALESCE(SUM(payment_amount),0) AS total FROM payments`);
    const [[totalInvoiced]] = await pool.query(`SELECT COALESCE(SUM(invoice_amount),0) AS total FROM invoices`);

    const [monthlyInvoiceVolume] = await pool.query(`
      SELECT DATE_FORMAT(invoice_date, '%Y-%m') AS month, COUNT(*) AS count, SUM(invoice_amount) AS amount
      FROM invoices GROUP BY month ORDER BY month ASC
    `);

    const [approvalBreakdown] = await pool.query(`
      SELECT approval_status, COUNT(*) AS count FROM invoices GROUP BY approval_status
    `);

    const [vendorPaymentDistribution] = await pool.query(`
      SELECT v.vendor_name, COALESCE(SUM(p.payment_amount), 0) AS total_paid
      FROM vendors v LEFT JOIN invoices i ON i.vendor_id = v.id
      LEFT JOIN payments p ON p.invoice_id = i.id
      GROUP BY v.id, v.vendor_name ORDER BY total_paid DESC LIMIT 10
    `);

    const [paymentTrends] = await pool.query(`
      SELECT DATE_FORMAT(payment_date, '%Y-%m') AS month, SUM(payment_amount) AS amount
      FROM payments GROUP BY month ORDER BY month ASC
    `);

    const [topVendorsByContractValue] = await pool.query(`
      SELECT v.vendor_name, SUM(c.contract_value) AS total_value
      FROM vendors v JOIN contracts c ON c.vendor_id = v.id
      GROUP BY v.id, v.vendor_name ORDER BY total_value DESC LIMIT 5
    `);

    const [vendorPerformance] = await pool.query(`
      SELECT v.id, v.vendor_name,
        COUNT(DISTINCT c.id) AS total_contracts,
        COUNT(DISTINCT i.id) AS total_invoices,
        SUM(CASE WHEN i.approval_status = 'Rejected' THEN 1 ELSE 0 END) AS rejected_invoices,
        SUM(CASE WHEN i.payment_status = 'Paid' THEN 1 ELSE 0 END) AS paid_invoices
      FROM vendors v
      LEFT JOIN contracts c ON c.vendor_id = v.id
      LEFT JOIN invoices i ON i.vendor_id = v.id
      GROUP BY v.id, v.vendor_name
      ORDER BY total_invoices DESC
    `);

    res.json({
      summary: {
        vendorCount: vendorCount.count,
        contractCount: contractCount.count,
        invoiceCount: invoiceCount.count,
        totalPaid: totalPaid.total,
        totalInvoiced: totalInvoiced.total,
        outstanding: Number(totalInvoiced.total) - Number(totalPaid.total),
      },
      monthlyInvoiceVolume,
      approvalBreakdown,
      vendorPaymentDistribution,
      paymentTrends,
      topVendorsByContractValue,
      vendorPerformance,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/finance  (finance_manager only)
exports.financeDashboard = async (req, res, next) => {
  try {
    const [[pendingCount]] = await pool.query(`SELECT COUNT(*) AS count FROM invoices WHERE approval_status = 'Pending'`);
    const [[approvedCount]] = await pool.query(`SELECT COUNT(*) AS count FROM invoices WHERE approval_status = 'Approved'`);
    const [[rejectedCount]] = await pool.query(`SELECT COUNT(*) AS count FROM invoices WHERE approval_status = 'Rejected'`);
    const [[unpaidTotal]] = await pool.query(`
      SELECT COALESCE(SUM(invoice_amount),0) AS total FROM invoices WHERE payment_status IN ('Unpaid','Partially Paid') AND approval_status='Approved'
    `);

    const [pendingInvoices] = await pool.query(`
      SELECT i.*, v.vendor_name, c.contract_title FROM invoices i
      JOIN vendors v ON i.vendor_id = v.id
      JOIN contracts c ON i.contract_id = c.id
      WHERE i.approval_status = 'Pending' ORDER BY i.invoice_date ASC LIMIT 10
    `);

    const [recentPayments] = await pool.query(`
      SELECT p.*, i.invoice_number, v.vendor_name FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN vendors v ON i.vendor_id = v.id
      ORDER BY p.payment_date DESC LIMIT 10
    `);

    res.json({
      summary: {
        pendingCount: pendingCount.count,
        approvedCount: approvedCount.count,
        rejectedCount: rejectedCount.count,
        outstandingApprovedAmount: unpaidTotal.total,
      },
      pendingInvoices,
      recentPayments,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/vendor  (vendor only)
exports.vendorDashboard = async (req, res, next) => {
  try {
    const vendorId = await getVendorIdForUser(req.user.id);
    if (!vendorId) return res.status(400).json({ message: 'No vendor profile linked to this user.' });

    const [[contractCount]] = await pool.query('SELECT COUNT(*) AS count FROM contracts WHERE vendor_id = ?', [vendorId]);
    const [[invoiceCount]] = await pool.query('SELECT COUNT(*) AS count FROM invoices WHERE vendor_id = ?', [vendorId]);
    const [[totalInvoiced]] = await pool.query('SELECT COALESCE(SUM(invoice_amount),0) AS total FROM invoices WHERE vendor_id = ?', [vendorId]);
    const [[totalReceived]] = await pool.query(`
      SELECT COALESCE(SUM(p.payment_amount),0) AS total FROM payments p
      JOIN invoices i ON p.invoice_id = i.id WHERE i.vendor_id = ?
    `, [vendorId]);

    const [recentInvoices] = await pool.query(`
      SELECT i.*, c.contract_title FROM invoices i JOIN contracts c ON i.contract_id = c.id
      WHERE i.vendor_id = ? ORDER BY i.created_at DESC LIMIT 10
    `, [vendorId]);

    const [contracts] = await pool.query('SELECT * FROM contracts WHERE vendor_id = ? ORDER BY start_date DESC', [vendorId]);

    res.json({
      summary: {
        contractCount: contractCount.count,
        invoiceCount: invoiceCount.count,
        totalInvoiced: totalInvoiced.total,
        totalReceived: totalReceived.total,
        outstanding: Number(totalInvoiced.total) - Number(totalReceived.total),
      },
      recentInvoices,
      contracts,
    });
  } catch (err) {
    next(err);
  }
};
