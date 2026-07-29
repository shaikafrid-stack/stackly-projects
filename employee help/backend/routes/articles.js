const express = require('express');
const router = express.Router();
const {
  getArticles, getArticleById, createArticle, updateArticle, deleteArticle,
} = require('../controllers/articleController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getArticles);
router.get('/:id', getArticleById);
router.post('/', authorize('support_engineer', 'admin'), createArticle);
router.put('/:id', authorize('support_engineer', 'admin'), updateArticle);
router.delete('/:id', authorize('admin'), deleteArticle);

module.exports = router;
