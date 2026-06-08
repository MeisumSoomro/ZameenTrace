const express = require('express');

const { placeholderUserHandler } = require('../controllers/user.controller');

const router = express.Router();

router.get('/', placeholderUserHandler);

module.exports = router;
