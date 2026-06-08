const jwt = require('jsonwebtoken');

const { env } = require('../config/env');

function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    const error = new Error('Authentication token is required.');
    error.statusCode = 401;
    return next(error);
  }

  try {
    req.auth = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (_err) {
    const error = new Error('Authentication token is invalid or expired.');
    error.statusCode = 401;
    return next(error);
  }
}

function requireRole(roles) {
  return (req, _res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      const error = new Error(
        'You do not have permission to perform this action.'
      );
      error.statusCode = 403;
      return next(error);
    }

    return next();
  };
}

module.exports = { requireAuth, requireRole };
