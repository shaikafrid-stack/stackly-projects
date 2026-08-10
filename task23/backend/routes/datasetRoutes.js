const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  getDatasets,
  getDatasetById,
  createDataset,
  updateDataset,
  deleteDataset,
  restoreDataset,
  toggleFavorite,
  getFavorites,
} = require('../controllers/datasetController');

router.use(authenticate);

// All authenticated roles can view
router.get('/', getDatasets);
router.get('/favorites/mine', getFavorites);
router.get('/:id', getDatasetById);

// Only Administrator + Data Steward can create/update
router.post('/', authorize('Administrator', 'Data Steward'), createDataset);
router.put('/:id', authorize('Administrator', 'Data Steward'), updateDataset);

// Archive / restore
router.delete('/:id', authorize('Administrator', 'Data Steward'), deleteDataset);
router.post('/:id/restore', authorize('Administrator'), restoreDataset);

// Favorites - any authenticated user (mainly for analysts)
router.post('/:id/favorite', toggleFavorite);

module.exports = router;
