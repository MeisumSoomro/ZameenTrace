// backend/src/middleware/auth.middleware.js
// JWT authentication middleware for protecting backend routes.
// Provides two strategies:
//   requireAuth  — rejects unauthenticated requests with 401.
//   optionalAuth — attaches auth if a valid token is present, but allows anonymous access.
// The MVP uses optionalAuth for parcel writes so the workflow can be tested without login.

const jwt = require('jsonwebtoken');

const { env } = require('../config/env');

/**
 * Strict auth — the request must include a valid Bearer token.
 * Used on admin-only or sensitive endpoints.
 */
function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    const error = new Error('Authentication token is required.');
    error.statusCode = 401;
    return next(error);
  }

  try {
    // Decode and verify the JWT — sets req.auth with { sub, email, role, fullName }.
    req.auth = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (_err) {
    const error = new Error('Authentication token is invalid or expired.');
    error.statusCode = 401;
    return next(error);
  }
}

/**
 * Optional auth — attach user identity if a token is present, but don't reject anonymous requests.
 * This allows the MVP frontend to call parcel endpoints without implementing a login flow,
 * while still supporting authenticated requests when a token is available.
 */
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  // No token present — continue as anonymous.
  if (scheme !== 'Bearer' || !token) {
    req.auth = null;
    return next();
  }

  try {
    req.auth = jwt.verify(token, env.jwtSecret);
  } catch (_err) {
    // Invalid token — treat as anonymous rather than rejecting.
    req.auth = null;
  }

  return next();
}

/**
 * Role-based guard — requires a specific role from the JWT payload.
 * Must be used after requireAuth in the middleware chain.
 */
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

module.exports = { requireAuth, optionalAuth, requireRole };
