const express = require('express');
const router = express.Router();
const { createPayment, getPayments } = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middlewares/auth');

router.post('/', authenticate, authorize('finance_manager', 'admin'), createPayment);
router.get('/', authenticate, getPayments);

module.exports = router;
