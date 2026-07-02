const express = require('express');

const { requireAuth } = require('../middleware/auth.middleware');
const {
  getProfileHandler,
  updateProfileHandler,
  getUserPropertiesHandler,
  placeholderUserHandler,
} = require('../controllers/user.controller');

const router = express.Router();

router.get('/', placeholderUserHandler);
router.get('/profile', requireAuth, getProfileHandler);
router.put('/profile', requireAuth, updateProfileHandler);
router.get('/properties', requireAuth, getUserPropertiesHandler);

module.exports = router;
