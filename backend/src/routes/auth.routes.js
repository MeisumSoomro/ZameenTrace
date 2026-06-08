const express = require('express');

const { createSessionHandler } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/session', createSessionHandler);

module.exports = router;
