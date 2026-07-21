const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);

router.get('/', goalController.getGoals);
router.get('/:id', goalController.getGoalById);

router.post(
  '/',
  authorize('employee', 'manager', 'admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('target_date').isDate().withMessage('A valid target_date (YYYY-MM-DD) is required'),
    body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
  ],
  validate,
  goalController.createGoal
);

router.put('/:id', authorize('employee', 'manager', 'admin'), goalController.updateGoal);
router.delete('/:id', authorize('manager', 'admin'), goalController.deleteGoal);

module.exports = router;
