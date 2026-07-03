const pool = require('../config/db');

// Helper: resolve vendor_id for the logged-in vendor user
async function getVendorIdForUser(userId) {
  const [rows] = await pool.query('SELECT id FROM vendors WHERE user_id = ?', [userId]);
  return rows.length ? rows[0].id : null;
}

// GET /api/contracts (vendor sees only their own contracts, admin/finance see all)
exports.getContracts = async (req, res, next) => {
  try {
    const { search = '', status = '', page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = ' WHERE 1=1 ';
    const params = [];

    if (req.user.role === 'vendor') {
      const vendorId = await getVendorIdForUser(req.user.id);
      where += ' AND c.vendor_id = ? ';
      params.push(vendorId);
    }
    if (search) {
      where += ' AND (c.contract_title LIKE ? OR v.vendor_name LIKE ?) ';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      where += ' AND c.status = ? ';
      params.push(status);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM contracts c JOIN vendors v ON c.vendor_id = v.id ${where}`,
      params
    );
    const [rows] = await pool.query(
      `SELECT c.*, v.vendor_name FROM contracts c JOIN vendors v ON c.vendor_id = v.id
       ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
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

// POST /api/contracts  (admin only)
exports.createContract = async (req, res, next) => {
  try {
    const { vendor_id, contract_title, start_date, end_date, contract_value, status } = req.body;
    if (!vendor_id || !contract_title || !start_date || !end_date) {
      return res.status(400).json({ message: 'vendor_id, contract_title, start_date, end_date are required.' });
    }
    const [result] = await pool.query(
      `INSERT INTO contracts (vendor_id, contract_title, start_date, end_date, contract_value, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [vendor_id, contract_title, start_date, end_date, contract_value || 0, status || 'draft']
    );
    const [rows] = await pool.query('SELECT * FROM contracts WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Contract created.', contract: rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/contracts/:id  (admin only)
exports.updateContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { contract_title, start_date, end_date, contract_value, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM contracts WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Contract not found.' });

    await pool.query(
      `UPDATE contracts SET contract_title = ?, start_date = ?, end_date = ?, contract_value = ?, status = ?
       WHERE id = ?`,
      [
        contract_title ?? existing[0].contract_title,
        start_date ?? existing[0].start_date,
        end_date ?? existing[0].end_date,
        contract_value ?? existing[0].contract_value,
        status ?? existing[0].status,
        id,
      ]
    );
    const [rows] = await pool.query('SELECT * FROM contracts WHERE id = ?', [id]);
    res.json({ message: 'Contract updated.', contract: rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/contracts/:id  (admin only)
exports.deleteContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT id FROM contracts WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Contract not found.' });

    await pool.query('DELETE FROM contracts WHERE id = ?', [id]);
    res.json({ message: 'Contract deleted.' });
  } catch (err) {
    next(err);
  }
};

exports.getVendorIdForUser = getVendorIdForUser;
