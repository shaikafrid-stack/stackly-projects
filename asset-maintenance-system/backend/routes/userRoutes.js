const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', authorize('admin'), getUsers);

module.exports = router;
