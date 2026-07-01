const router = require('express').Router();
const { getAllUsers, getAgents, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
router.use(protect);
router.get('/', authorize('admin'), getAllUsers);
router.get('/agents', authorize('admin'), getAgents);
router.route('/:id').put(authorize('admin'), updateUser).delete(authorize('admin'), deleteUser);
module.exports = router;
