const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { ROLES } = require('../config/constants');
const {
  listDatasets,
  getDataset,
  uploadDataset,
  deleteDataset,
} = require('../controllers/datasetController');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.use(authenticate);

router.get('/', listDatasets);
router.get('/:id', getDataset);
router.post('/', authorize(ROLES.ADMIN, ROLES.ANALYST, ROLES.STEWARD), upload.single('file'), uploadDataset);
router.delete('/:id', authorize(ROLES.ADMIN), deleteDataset);

module.exports = router;
