const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Managers can fetch their own direct reports (used to populate the "assign goal" dropdown)
router.get('/my-team', authenticate, authorize('manager', 'admin'), userController.getMyTeam);

router.use(authenticate, authorize('admin'));

router.get('/', userController.getUsers);
router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['admin', 'manager', 'employee']),
  ],
  validate,
  userController.createUser
);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
