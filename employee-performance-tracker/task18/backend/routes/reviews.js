const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);

router.post(
  '/',
  [body('goal_id').isInt().withMessage('goal_id is required')],
  validate,
  reviewController.createReview
);
router.get('/', reviewController.getReviews);
router.put('/:id', reviewController.updateReview);

module.exports = router;
