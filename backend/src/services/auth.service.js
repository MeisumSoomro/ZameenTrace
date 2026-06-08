const jwt = require('jsonwebtoken');

const { env } = require('../config/env');

const allowedRoles = [
  'farmer',
  'neighbor',
  'operator',
  'government_admin',
  'surveyor',
  'viewer',
];

function createSession(payload) {
  const {
    userId,
    email,
    role = 'operator',
    fullName = 'ZameenTrace User',
  } = payload;

  if (!env.demoAuthEnabled) {
    const error = new Error(
      'Demo session creation is disabled. Set DEMO_AUTH_ENABLED=true to use the scaffolded auth endpoint.'
    );
    error.statusCode = 403;
    throw error;
  }

  if (!userId || !email) {
    const error = new Error(
      'userId and email are required to create a session.'
    );
    error.statusCode = 400;
    throw error;
  }

  if (!allowedRoles.includes(role)) {
    const error = new Error(`role must be one of: ${allowedRoles.join(', ')}.`);
    error.statusCode = 400;
    throw error;
  }

  const token = jwt.sign(
    {
      sub: userId,
      email,
      role,
      fullName,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );

  return {
    token,
    user: {
      id: userId,
      email,
      role,
      fullName,
    },
  };
}

module.exports = { createSession };
