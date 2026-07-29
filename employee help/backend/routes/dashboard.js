const express = require('express');
const router = express.Router();
const {
  employeeDashboard, supportDashboard, adminDashboard,
} = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/employee', authorize('employee'), employeeDashboard);
router.get('/support', authorize('support_engineer'), supportDashboard);
router.get('/admin', authorize('admin'), adminDashboard);

module.exports = router;
