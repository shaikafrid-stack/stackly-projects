const express = require('express');
const router = express.Router();
const { adminDashboard, financeDashboard, vendorDashboard } = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/admin', authenticate, authorize('admin'), adminDashboard);
router.get('/finance', authenticate, authorize('finance_manager', 'admin'), financeDashboard);
router.get('/vendor', authenticate, authorize('vendor'), vendorDashboard);

module.exports = router;
