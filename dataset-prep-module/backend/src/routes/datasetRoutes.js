const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { listDatasets, getDataset, previewDataset } = require('../controllers/datasetController');
const {
  addTransformation, listTransformations, reorderTransformations,
  previewTransformations, validateDataset, getValidationResults
} = require('../controllers/transformationController');
const { listVersions, getVersion, createVersion, deleteVersion } = require('../controllers/versionController');
const { getHistory } = require('../controllers/historyController');

const router = express.Router();

const ALL_ROLES = ['ADMIN', 'DATA_STEWARD', 'DATA_ANALYST'];
const CAN_TRANSFORM = ['ADMIN', 'DATA_STEWARD', 'DATA_ANALYST'];
const CAN_VALIDATE_AND_SAVE = ['ADMIN', 'DATA_STEWARD'];

router.get('/', authenticate, authorize(...ALL_ROLES), listDatasets);
router.get('/:id', authenticate, authorize(...ALL_ROLES), getDataset);
router.get('/:id/preview', authenticate, authorize(...ALL_ROLES), previewDataset);

router.post('/:id/transform', authenticate, authorize(...CAN_TRANSFORM), addTransformation);
router.get('/:id/transformations', authenticate, authorize(...ALL_ROLES), listTransformations);
router.put('/:id/transformations/reorder', authenticate, authorize(...CAN_TRANSFORM), reorderTransformations);
router.post('/:id/transformations/preview', authenticate, authorize(...ALL_ROLES), previewTransformations);

router.post('/:id/validate', authenticate, authorize(...CAN_VALIDATE_AND_SAVE), validateDataset);
router.get('/:id/validation-results', authenticate, authorize(...ALL_ROLES), getValidationResults);

router.get('/:id/versions', authenticate, authorize(...ALL_ROLES), listVersions);
router.post('/:id/versions', authenticate, authorize(...CAN_VALIDATE_AND_SAVE), createVersion);
router.get('/:id/versions/:versionId', authenticate, authorize(...ALL_ROLES), getVersion);
router.delete('/:id/versions/:versionId', authenticate, authorize('ADMIN'), deleteVersion);

router.get('/:id/history', authenticate, authorize(...ALL_ROLES), getHistory);

module.exports = router;
