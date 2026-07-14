const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
} = require('../controllers/expense.controller');

router.use(authenticate);

router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.post('/', authorize('employee'), createExpense);
router.put('/:id', authorize('employee'), updateExpense);
router.delete('/:id', authorize('employee', 'admin'), deleteExpense);

router.put('/:id/approve', authorize('manager', 'admin'), approveExpense);
router.put('/:id/reject', authorize('manager', 'admin'), rejectExpense);

module.exports = router;
