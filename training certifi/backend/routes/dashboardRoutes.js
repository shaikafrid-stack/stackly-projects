const express = require('express');
const router = express.Router();
const { adminDashboard, trainerDashboard, employeeDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/admin', protect, authorize('admin'), adminDashboard);
router.get('/trainer', protect, authorize('trainer'), trainerDashboard);
router.get('/employee', protect, authorize('employee'), employeeDashboard);

module.exports = router;
