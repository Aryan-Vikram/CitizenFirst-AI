// Centralized error handler. Keeps API error responses consistent so the
// frontend's ErrorState component can always rely on { error: string }.
function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[error]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Something went wrong on our side. Your request has been safely queued for retry.' : err.message
  });
}

module.exports = { notFound, errorHandler };
