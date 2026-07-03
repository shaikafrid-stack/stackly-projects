const pool = require('../config/db');

// GET /api/vendors  (supports ?search=&status=&page=&limit=)
exports.getVendors = async (req, res, next) => {
  try {
    const { search = '', status = '', page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = ' WHERE 1=1 ';
    const params = [];
    if (search) {
      where += ' AND (vendor_name LIKE ? OR contact_person LIKE ? OR email LIKE ?) ';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      where += ' AND status = ? ';
      params.push(status);
    }

    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM vendors ${where}`, params);
    const [rows] = await pool.query(
      `SELECT * FROM vendors ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
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

// POST /api/vendors  (admin only)
exports.createVendor = async (req, res, next) => {
  try {
    const { vendor_name, contact_person, phone, email, address, status } = req.body;
    if (!vendor_name) return res.status(400).json({ message: 'vendor_name is required.' });

    const [result] = await pool.query(
      `INSERT INTO vendors (vendor_name, contact_person, phone, email, address, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [vendor_name, contact_person || null, phone || null, email || null, address || null, status || 'active']
    );
    const [rows] = await pool.query('SELECT * FROM vendors WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Vendor created.', vendor: rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/vendors/:id  (admin only)
exports.updateVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vendor_name, contact_person, phone, email, address, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM vendors WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Vendor not found.' });

    await pool.query(
      `UPDATE vendors SET vendor_name = ?, contact_person = ?, phone = ?, email = ?, address = ?, status = ?
       WHERE id = ?`,
      [
        vendor_name ?? existing[0].vendor_name,
        contact_person ?? existing[0].contact_person,
        phone ?? existing[0].phone,
        email ?? existing[0].email,
        address ?? existing[0].address,
        status ?? existing[0].status,
        id,
      ]
    );
    const [rows] = await pool.query('SELECT * FROM vendors WHERE id = ?', [id]);
    res.json({ message: 'Vendor updated.', vendor: rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/vendors/:id  (admin only)
exports.deleteVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT id FROM vendors WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Vendor not found.' });

    await pool.query('DELETE FROM vendors WHERE id = ?', [id]);
    res.json({ message: 'Vendor deleted.' });
  } catch (err) {
    next(err);
  }
};
