const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  register,
  login,
  profile,
  listUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, profile);

// User management (admin only)
router.get('/users', authenticate, authorize('admin'), listUsers);
router.put('/users/:id/role', authenticate, authorize('admin'), updateUserRole);
router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;
