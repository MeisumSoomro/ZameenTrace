// backend/src/middleware/error.middleware.js
// Catches all unhandled errors from route handlers and returns a consistent JSON response.
// Maps PostgreSQL error codes to appropriate HTTP status codes so the frontend gets useful feedback.

/**
 * Express error handler — must have 4 parameters so Express recognizes it as error middleware.
 * Logs server errors to the console for debugging and returns a structured JSON error.
 */
function errorMiddleware(error, _req, res, _next) {
  const statusCode = error.statusCode || inferStatusCode(error);

  // Log 5xx errors to console so developers can debug server-side failures.
  if (statusCode >= 500) {
    console.error('[ZameenTrace Error]', error);
  }

  res.status(statusCode).json({
    message: error.message || 'Unexpected server error.',
    // Include extra detail in non-production environments for easier debugging.
    ...(process.env.NODE_ENV !== 'production' && error.detail
      ? { detail: error.detail }
      : {}),
  });
}

/**
 * Map common PostgreSQL error codes to HTTP status codes.
 * This way the frontend gets a meaningful 400/409 instead of a generic 500.
 */
function inferStatusCode(error) {
  // 23505 = unique_violation — e.g. duplicate parcel_id.
  if (error.code === '23505') {
    return 409;
  }

  // 22P02 = invalid_text_representation (bad UUID format, etc.)
  // 23502 = not_null_violation
  // 23514 = check_violation
  if (
    error.code === '22P02' ||
    error.code === '23502' ||
    error.code === '23514'
  ) {
    return 400;
  }

  return 500;
}

module.exports = { errorMiddleware };
