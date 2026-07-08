const express = require('express');
const router = express.Router();
const {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  deleteServiceRequest,
} = require('../controllers/serviceRequestController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

router.post('/', authorize('employee'), createServiceRequest);
router.get('/', getServiceRequests);
router.get('/:id', getServiceRequestById);
router.put('/:id', authorize('admin', 'maintenance_engineer'), updateServiceRequest);
router.delete('/:id', authorize('admin'), deleteServiceRequest);

module.exports = router;
