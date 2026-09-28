const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const datasetController = require('../controllers/dataset.controller');
const versionController = require('../controllers/version.controller');

// All dataset routes require authentication
router.use(authenticate);

// Dataset CRUD
router.get('/', datasetController.listDatasets);
router.get('/:id', datasetController.getDataset);
router.post('/', authorize('Admin', 'Data Steward'), datasetController.createDataset);

// Nested version routes
router.get('/:datasetId/versions', versionController.getVersions);
router.post('/:datasetId/versions', authorize('Admin', 'Data Steward'), versionController.createVersion);
router.get('/:datasetId/change-history', versionController.getChangeHistory);
router.get('/:datasetId/lineage', versionController.getLineage);

module.exports = router;
