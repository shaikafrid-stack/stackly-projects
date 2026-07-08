const express = require('express');
const router = express.Router();
const {
  adminDashboard,
  maintenanceDashboard,
  employeeDashboard,
} = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

router.get('/admin', authorize('admin'), adminDashboard);
router.get('/maintenance', authorize('maintenance_engineer'), maintenanceDashboard);
router.get('/employee', authorize('employee'), employeeDashboard);

module.exports = router;
