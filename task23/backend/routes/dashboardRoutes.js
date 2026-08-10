const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const { adminDashboard, stewardDashboard, analystDashboard } = require('../controllers/dashboardController');

router.use(authenticate);

router.get('/admin', authorize('Administrator'), adminDashboard);
router.get('/steward', authorize('Administrator', 'Data Steward'), stewardDashboard);
router.get('/analyst', authorize('Administrator', 'Data Steward', 'Data Analyst'), analystDashboard);

module.exports = router;
