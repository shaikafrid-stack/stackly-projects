const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getDashboardSummary } = require('../controllers/dataset.controller');

router.use(authenticate);
router.get('/summary', getDashboardSummary);

module.exports = router;
