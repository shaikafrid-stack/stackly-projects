const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const versionController = require('../controllers/version.controller');

router.use(authenticate);

// IMPORTANT: /compare must be declared before /:id so it isn't captured as an id param
router.get('/compare', versionController.compareVersionsHandler);
router.get('/:id', versionController.getVersionDetails);
router.post('/:id/restore', authorize('Admin'), versionController.restoreVersion);
router.patch('/:id/status', authorize('Admin', 'Data Steward'), versionController.updateVersionStatus);

module.exports = router;
