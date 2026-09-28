const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Demo users. In a production system these would live in a `User` table
 * with hashed passwords; for this module's scope, login simply issues a
 * JWT carrying the selected role so RBAC on every route can be exercised.
 */
const DEMO_USERS = [
  { id: 1, username: 'admin', password: 'admin123', role: 'Admin', displayName: 'Ava Admin' },
  { id: 2, username: 'steward', password: 'steward123', role: 'Data Steward', displayName: 'Sam Steward' },
  { id: 3, username: 'analyst', password: 'analyst123', role: 'Data Analyst', displayName: 'Ana Analyst' },
];

// POST /api/auth/login
function login(req, res) {
  const { username, password } = req.body;
  const user = DEMO_USERS.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, displayName: user.displayName },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  res.json({
    success: true,
    data: { token, user: { id: user.id, username: user.username, role: user.role, displayName: user.displayName } },
  });
}

// GET /api/auth/roles - so the frontend demo login screen can list roles
function listDemoAccounts(req, res) {
  res.json({
    success: true,
    data: DEMO_USERS.map((u) => ({ username: u.username, role: u.role, displayName: u.displayName })),
  });
}

module.exports = { login, listDemoAccounts };
