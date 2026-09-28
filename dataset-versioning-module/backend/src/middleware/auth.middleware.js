const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Verifies the bearer token and attaches the decoded user (id, username, role)
 * to req.user. In this reference implementation, login issues a signed JWT
 * containing the user's role so every downstream route can authorize on it.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Missing or invalid Authorization header' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

/**
 * Role-based access control.
 * Usage: authorize('Admin', 'Data Steward')
 *
 * Roles in this module:
 *  - Admin:        view, create, restore, manage versions, manage users
 *  - Data Steward:  create, compare, manage versions
 *  - Data Analyst:  view and compare versions only
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' is not permitted to perform this action`,
      });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
