const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'Duplicate entry', details: err.errors?.map(e => e.message) });
  }
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ message: 'Validation error', details: err.errors?.map(e => e.message) });
  }

  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
};

module.exports = errorHandler;
