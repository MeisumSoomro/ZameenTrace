// backend/src/config/env.js
// Centralized environment configuration.
// Reads from process.env (populated by dotenv in server.js) and provides defaults
// so the backend can start in development even when some vars are missing.
// All other modules import { env } from this file instead of reading process.env directly.

// Warn on missing required variables instead of crashing — this makes local development
// smoother when the developer hasn't set up a .env file yet.
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(
    `Missing environment variables: ${missingVars.join(', ')}. Falling back to defaults.`
  );
}

const env = {
  // Server port — the frontend expects the backend on 4000.
  port: Number(process.env.PORT || 4000),

  // PostgreSQL connection string — includes host, port, user, password, and database name.
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT signing secret — MUST be changed in production.
  jwtSecret: process.env.JWT_SECRET || 'replace-with-a-secure-secret',

  // Token expiration — how long a login session lasts.
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',

  // Allowed frontend origin for CORS — prevents unauthorized cross-origin requests.
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Maximum JSON body size — protects against oversized payloads.
  requestBodyLimit: process.env.REQUEST_BODY_LIMIT || '1mb',

  // When true, the /auth/session endpoint creates tokens without password verification.
  // Useful for MVP testing but should be disabled in production.
  demoAuthEnabled: process.env.DEMO_AUTH_ENABLED === 'true',
};

module.exports = { env };
