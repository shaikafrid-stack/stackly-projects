const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/datasets', require('./datasetRoutes'));
router.use('/datasets', require('./profileRoutes'));
router.use('/datasets', require('./qualityRoutes'));
router.use('/quality-rules', require('./qualityRuleRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));

module.exports = router;
