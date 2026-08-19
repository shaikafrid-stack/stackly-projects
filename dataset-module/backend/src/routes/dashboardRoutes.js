const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.get('/datasets', authenticate, dashboardController.dashboard);

module.exports = router;
