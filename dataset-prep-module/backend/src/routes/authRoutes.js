const express = require('express');
const { login, register, me } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/register', authenticate, authorize('ADMIN'), register);
router.get('/me', authenticate, me);

module.exports = router;
