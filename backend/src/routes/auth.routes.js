const express = require('express');

const {
  createSessionHandler,
  registerHandler,
  loginHandler,
} = require('../controllers/auth.controller');

const router = express.Router();

// Real auth endpoints
router.post('/register', registerHandler);
router.post('/login', loginHandler);

// Demo session endpoint (requires DEMO_AUTH_ENABLED=true)
router.post('/session', createSessionHandler);

module.exports = router;
