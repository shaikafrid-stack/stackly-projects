const express = require('express');
const router = express.Router();
const { issueCertification, getCertifications } = require('../controllers/certificationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('trainer', 'admin'), issueCertification);
router.get('/', protect, getCertifications);

module.exports = router;
