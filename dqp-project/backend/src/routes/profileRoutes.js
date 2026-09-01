const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { ROLES } = require('../config/constants');
const {
  runProfiling,
  getLatestProfile,
  getColumnProfiles,
  getColumnProfileById,
} = require('../controllers/profileController');

router.use(authenticate);

router.post('/:id/profile', authorize(ROLES.ADMIN, ROLES.ANALYST, ROLES.STEWARD), runProfiling);
router.get('/:id/profile', getLatestProfile);
router.get('/:id/profile/columns', getColumnProfiles);
router.get('/:id/profile/columns/:columnId', getColumnProfileById);

module.exports = router;
