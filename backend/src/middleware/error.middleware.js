function errorMiddleware(error, _req, res, _next) {
  const statusCode = error.statusCode || inferStatusCode(error);

  res.status(statusCode).json({
    message: error.message || 'Unexpected server error.',
    ...(process.env.NODE_ENV !== 'production' && error.detail
      ? { detail: error.detail }
      : {}),
  });
}

function inferStatusCode(error) {
  if (error.code === '23505') {
    return 409;
  }

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
