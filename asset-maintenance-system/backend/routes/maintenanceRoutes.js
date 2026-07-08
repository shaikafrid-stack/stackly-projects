const express = require('express');
const router = express.Router();
const { createMaintenanceLog, getMaintenanceLogs } = require('../controllers/maintenanceController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

router.post('/', authorize('maintenance_engineer'), createMaintenanceLog);
router.get('/', getMaintenanceLogs);

module.exports = router;
