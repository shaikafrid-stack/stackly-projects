const express = require('express');
const router = express.Router();
const {
  getTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
} = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getTrainings);
router.get('/:id', protect, getTrainingById);
router.post('/', protect, authorize('trainer', 'admin'), createTraining);
router.put('/:id', protect, authorize('trainer', 'admin'), updateTraining);
router.delete('/:id', protect, authorize('trainer', 'admin'), deleteTraining);

module.exports = router;
