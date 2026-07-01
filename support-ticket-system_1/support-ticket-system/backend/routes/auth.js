const router = require('express').Router();
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
module.exports = router;
