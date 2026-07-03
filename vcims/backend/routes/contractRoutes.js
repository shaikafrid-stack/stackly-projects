const express = require('express');
const router = express.Router();
const { getContracts, createContract, updateContract, deleteContract } = require('../controllers/contractController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', authenticate, getContracts); // vendor: own only, admin/finance: all
router.post('/', authenticate, authorize('admin'), createContract);
router.put('/:id', authenticate, authorize('admin'), updateContract);
router.delete('/:id', authenticate, authorize('admin'), deleteContract);

module.exports = router;
