function notFound(req, res) {
  res.status(404).json({ message: 'Route not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  if (err?.code === 11000) {
    status = 409;
    const keys = Object.keys(err.keyPattern || err.keyValue || {});
    message = keys.length ? `Duplicate value for: ${keys.join(', ')}` : 'Duplicate key';
  }

  if (err?.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
  }
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
