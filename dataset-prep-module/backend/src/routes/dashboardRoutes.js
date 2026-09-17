const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getDashboard } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/data-preparation', authenticate, authorize('ADMIN', 'DATA_STEWARD', 'DATA_ANALYST'), getDashboard);

module.exports = router;
