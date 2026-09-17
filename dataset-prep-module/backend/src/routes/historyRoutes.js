const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getHistory } = require('../controllers/historyController');

const router = express.Router();

router.get('/', authenticate, authorize('ADMIN', 'DATA_STEWARD', 'DATA_ANALYST'), getHistory);

module.exports = router;
