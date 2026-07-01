const router = require('express').Router();
const { adminDashboard, agentDashboard, customerDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/auth');
router.use(protect);
router.get('/admin', authorize('admin'), adminDashboard);
router.get('/agent', authorize('agent'), agentDashboard);
router.get('/customer', authorize('customer'), customerDashboard);
module.exports = router;
