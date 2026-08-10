const express = require('express');
const router = express.Router({ mergeParams: true });
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const { getTags, addTag, deleteTag } = require('../controllers/tagController');

router.use(authenticate);

router.get('/', getTags);
router.post('/', authorize('Administrator', 'Data Steward'), addTag);
router.delete('/:tagId', authorize('Administrator', 'Data Steward'), deleteTag);

module.exports = router;
