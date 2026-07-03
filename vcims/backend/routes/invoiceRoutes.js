const express = require('express');
const router = express.Router();
const {
  getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice, approveInvoice, rejectInvoice,
} = require('../controllers/invoiceController');
const { authenticate, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/', authenticate, getInvoices);
router.get('/:id', authenticate, getInvoiceById);
router.post('/', authenticate, authorize('vendor'), upload.single('invoice_file'), createInvoice);
router.put('/:id', authenticate, updateInvoice); // permission check inside controller
router.delete('/:id', authenticate, deleteInvoice); // permission check inside controller

// Approval workflow - restricted to finance_manager and admin
router.put('/:id/approve', authenticate, authorize('finance_manager', 'admin'), approveInvoice);
router.put('/:id/reject', authenticate, authorize('finance_manager', 'admin'), rejectInvoice);

module.exports = router;
