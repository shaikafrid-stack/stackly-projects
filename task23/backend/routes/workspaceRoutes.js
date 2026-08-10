const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const { getWorkspaces, createWorkspace, updateWorkspace } = require('../controllers/workspaceController');

router.use(authenticate);

router.get('/', getWorkspaces);
router.post('/', authorize('Administrator'), createWorkspace);
router.put('/:id', authorize('Administrator'), updateWorkspace);

module.exports = router;
