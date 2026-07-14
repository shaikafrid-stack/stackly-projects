const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { employeeDashboard, managerDashboard, adminDashboard } = require('../controllers/dashboard.controller');

router.get('/employee', authenticate, authorize('employee'), employeeDashboard);
router.get('/manager', authenticate, authorize('manager', 'admin'), managerDashboard);
router.get('/admin', authenticate, authorize('admin'), adminDashboard);

module.exports = router;
