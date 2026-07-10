// Central error-handling middleware. Any `next(err)` call ends up here.
function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
