// Centralized error handler
function errorHandler(err, req, res, next) {
  console.error(err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
  });
}

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
