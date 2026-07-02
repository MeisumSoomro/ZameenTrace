const { createSession } = require('../services/auth.service');
const { registerUser, loginUser } = require('../services/user.service');

/**
 * Demo session endpoint — issues a JWT for any userId+email combo.
 * Only works when DEMO_AUTH_ENABLED=true.
 */
async function createSessionHandler(req, res, next) {
  try {
    const result = await createSession(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Real registration — creates a user in the DB with a hashed password.
 */
async function registerHandler(req, res, next) {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Real login — validates email + password against the users table.
 */
async function loginHandler(req, res, next) {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { createSessionHandler, registerHandler, loginHandler };
