const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { getDashboardData } = require('../controllers/dashboardController');

router.use(authenticate);
router.get('/data-quality', getDashboardData);

module.exports = router;
