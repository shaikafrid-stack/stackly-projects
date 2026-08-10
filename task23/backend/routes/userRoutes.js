const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const { getUsers, updateUserRole } = require('../controllers/userController');

router.use(authenticate);

router.get('/', authorize('Administrator'), getUsers);
router.put('/:id', authorize('Administrator'), updateUserRole);

module.exports = router;
