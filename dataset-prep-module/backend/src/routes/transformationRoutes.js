const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { updateTransformation, deleteTransformation } = require('../controllers/transformationController');

const router = express.Router();
const CAN_TRANSFORM = ['ADMIN', 'DATA_STEWARD', 'DATA_ANALYST'];

router.put('/:stepId', authenticate, authorize(...CAN_TRANSFORM), updateTransformation);
router.delete('/:stepId', authenticate, authorize(...CAN_TRANSFORM), deleteTransformation);

module.exports = router;
