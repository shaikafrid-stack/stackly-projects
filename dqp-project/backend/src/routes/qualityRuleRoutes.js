const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { ROLES } = require('../config/constants');
const { listRules, createRule, updateRule, deleteRule } = require('../controllers/qualityRuleController');

router.use(authenticate);

router.get('/', listRules);
router.post('/', authorize(ROLES.ADMIN, ROLES.STEWARD), createRule);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.STEWARD), updateRule);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.STEWARD), deleteRule);

module.exports = router;
