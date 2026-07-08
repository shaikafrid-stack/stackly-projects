const express = require('express');
const router = express.Router();
const {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} = require('../controllers/assetController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', getAssets);
router.get('/:id', getAssetById);
router.post('/', authorize('admin'), createAsset);
router.put('/:id', authorize('admin'), updateAsset);
router.delete('/:id', authorize('admin'), deleteAsset);

module.exports = router;
