// backend/src/services/user.service.js
// Handles user registration, login, and profile lookup.
// Part of the auth flow — the MVP uses demo sessions but this supports real passwords too.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { pool } = require('../utils/db');
const { env } = require('../config/env');

// bcrypt cost factor — 10 rounds is a good balance between speed and security.
const SALT_ROUNDS = 10;

// Keep this list in sync with the user_role enum in the database schema.
const allowedRoles = [
  'farmer',
  'neighbor',
  'operator',
  'government_admin',
  'surveyor',
  'viewer',
];

// Helper to create structured errors with HTTP status codes for the error middleware.
function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Sign a JWT containing the user's identity and role.
// The frontend stores this token and sends it as a Bearer header on protected requests.
function issueToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

// Transform a raw database row into a clean JSON object for API responses.
// Keeps the API contract consistent regardless of how column names change.
function mapUserRow(row) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    phone: row.phone || null,
    organizationName: row.organization_name || null,
    preferredLanguage: row.preferred_language || 'en',
    createdAt: row.created_at,
  };
}

/**
 * Register a new user with email + password.
 * The password is hashed with bcrypt and stored in the dedicated password_hash column.
 * Returns a JWT so the user is immediately authenticated after registration.
 */
async function registerUser({ fullName, email, password, phone = null, role = 'operator', organizationName = null }) {
  if (!fullName || !email || !password) {
    throw createError('fullName, email, and password are required.');
  }

  if (!allowedRoles.includes(role)) {
    throw createError(`role must be one of: ${allowedRoles.join(', ')}.`);
  }

  if (password.length < 8) {
    throw createError('Password must be at least 8 characters.');
  }

  // Check for existing user before hashing to fail fast on duplicates.
  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  if (existing.rowCount > 0) {
    throw createError('An account with this email already exists.', 409);
  }

  // Hash the password — bcrypt includes the salt in the output string.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Store password_hash in its own column (not in metadata JSONB) for clarity.
  const result = await pool.query(
    `INSERT INTO users (full_name, email, phone, role, organization_name, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, full_name, email, phone, role, organization_name, preferred_language, created_at`,
    [
      fullName,
      email,
      phone,
      role,
      organizationName,
      passwordHash,
    ]
  );

  const user = result.rows[0];
  const token = issueToken(user);

  return { token, user: mapUserRow(user) };
}

/**
 * Login an existing user with email + password.
 * Compares the provided password against the stored bcrypt hash.
 */
async function loginUser({ email, password }) {
  if (!email || !password) {
    throw createError('email and password are required.');
  }

  const result = await pool.query(
    `SELECT id, full_name, email, phone, role, organization_name, preferred_language, password_hash, created_at
     FROM users WHERE email = $1`,
    [email]
  );

  if (result.rowCount === 0) {
    throw createError('Invalid email or password.', 401);
  }

  const user = result.rows[0];

  // If the user has no password_hash, they were created via demo session or seed data.
  if (!user.password_hash) {
    throw createError('This account was created without a password. Please use the demo session endpoint.', 403);
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw createError('Invalid email or password.', 401);
  }

  const token = issueToken(user);
  return { token, user: mapUserRow(user) };
}

/**
 * Get a user profile by their UUID (from the JWT sub claim).
 * Used by the /users/profile endpoint.
 */
async function getUserById(userId) {
  const result = await pool.query(
    `SELECT id, full_name, email, phone, role, organization_name, preferred_language, created_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rowCount === 0) {
    throw createError('User not found.', 404);
  }

  return mapUserRow(result.rows[0]);
}

module.exports = { registerUser, loginUser, getUserById };
