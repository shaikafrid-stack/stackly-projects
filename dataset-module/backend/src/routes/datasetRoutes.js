const router = require('express').Router();
const datasetController = require('../controllers/datasetController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Both roles can view; only ANALYST can upload/validate/process; only ADMIN can delete
router.post('/upload', authenticate, authorize('ANALYST'), upload.single('file'), datasetController.upload);
router.get('/', authenticate, datasetController.list);
router.get('/:id', authenticate, datasetController.getOne);
router.delete('/:id', authenticate, authorize('ADMIN'), datasetController.remove);

router.get('/:id/preview', authenticate, datasetController.preview);
router.get('/:id/schema', authenticate, datasetController.schema);

router.post('/:id/validate', authenticate, authorize('ANALYST'), datasetController.validate);
router.get('/:id/validation-results', authenticate, datasetController.validationResults);

router.post('/:id/process', authenticate, authorize('ANALYST'), datasetController.process);
router.get('/:id/processing-status', authenticate, datasetController.processingStatus);

module.exports = router;
