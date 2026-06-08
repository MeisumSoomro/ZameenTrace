const { createSession } = require('../services/auth.service');

async function createSessionHandler(req, res, next) {
  try {
    const result = createSession(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { createSessionHandler };
