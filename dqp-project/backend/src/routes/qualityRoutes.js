const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { getQualityResults, getQualityIssues } = require('../controllers/qualityController');

router.use(authenticate);

router.get('/:id/quality', getQualityResults);
router.get('/:id/quality/issues', getQualityIssues);

module.exports = router;
