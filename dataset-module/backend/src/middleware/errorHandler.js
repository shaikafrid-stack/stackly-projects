const multer = require('multer');

// Centralized error handler - keeps error formatting/logic out of controllers
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File exceeds the maximum allowed size.' });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err.message && err.message.includes('Unsupported file type')) {
    return res.status(400).json({ message: err.message });
  }

  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
}

module.exports = errorHandler;
