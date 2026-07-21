const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/admin', authorize('admin'), dashboardController.adminDashboard);
router.get('/manager', authorize('manager', 'admin'), dashboardController.managerDashboard);
router.get('/employee', authorize('employee', 'manager', 'admin'), dashboardController.employeeDashboard);

module.exports = router;
