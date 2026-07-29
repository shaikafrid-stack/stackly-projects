const express = require('express');
const router = express.Router();
const { getUsers, getEngineers, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('admin'), getUsers);
router.get('/engineers', authorize('admin', 'support_engineer'), getEngineers);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
