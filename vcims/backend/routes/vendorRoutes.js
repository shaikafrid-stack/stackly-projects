const express = require('express');
const router = express.Router();
const { getVendors, createVendor, updateVendor, deleteVendor } = require('../controllers/vendorController');
const { authenticate, authorize } = require('../middlewares/auth');

// All authenticated users can view the vendor list (vendor sees limited use of it in UI)
router.get('/', authenticate, getVendors);
// Only admin manages vendor master data
router.post('/', authenticate, authorize('admin'), createVendor);
router.put('/:id', authenticate, authorize('admin'), updateVendor);
router.delete('/:id', authenticate, authorize('admin'), deleteVendor);

module.exports = router;
