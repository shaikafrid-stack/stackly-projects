const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, vendor_name, phone, address } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required.' });
    }
    if (!['admin', 'finance_manager', 'vendor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, role]
    );

    // If registering as a vendor, auto-create the linked vendor profile
    if (role === 'vendor') {
      await pool.query(
        `INSERT INTO vendors (user_id, vendor_name, contact_person, phone, email, address, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')`,
        [result.insertId, vendor_name || name, name, phone || null, email, address || null]
      );
    }

    const user = { id: result.insertId, name, email, role };
    const token = signToken(user);
    res.status(201).json({ message: 'Registration successful.', token, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user);
    delete user.password;
    res.json({ message: 'Login successful.', token, user });
  } catch (err) {
    next(err);
  }
};

// GET /api/profile
exports.getProfile = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });

    let vendorProfile = null;
    if (req.user.role === 'vendor') {
      const [vendorRows] = await pool.query('SELECT * FROM vendors WHERE user_id = ?', [req.user.id]);
      vendorProfile = vendorRows[0] || null;
    }

    res.json({ user: rows[0], vendorProfile });
  } catch (err) {
    next(err);
  }
};
