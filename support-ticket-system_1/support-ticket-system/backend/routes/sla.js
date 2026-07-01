const router = require('express').Router();
const { getAllSLA, updateSLA } = require('../controllers/slaController');
const { protect, authorize } = require('../middlewares/auth');
router.use(protect, authorize('admin'));
router.get('/', getAllSLA);
router.put('/:ticket_id', updateSLA);
module.exports = router;
