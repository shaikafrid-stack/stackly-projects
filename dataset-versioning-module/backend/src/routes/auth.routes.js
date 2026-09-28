const router = require('express').Router();
const { login, listDemoAccounts } = require('../controllers/auth.controller');

router.post('/login', login);
router.get('/demo-accounts', listDemoAccounts);

module.exports = router;
