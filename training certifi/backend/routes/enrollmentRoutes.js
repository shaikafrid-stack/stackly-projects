const express = require('express');
const router = express.Router();
const {
  createEnrollment,
  getEnrollments,
  updateEnrollment,
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('employee'), createEnrollment);
router.get('/', protect, getEnrollments);
router.put('/:id', protect, authorize('trainer', 'admin', 'employee'), updateEnrollment);

module.exports = router;
