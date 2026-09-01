const express = require('express');
const router = express.Router();
const { login, register, me } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, me);

module.exports = router;
