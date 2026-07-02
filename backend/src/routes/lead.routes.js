const express = require('express');

const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const {
  createLeadSubmissionHandler,
  listLeadSubmissionsHandler,
  updateLeadSubmissionStatusHandler,
} = require('../controllers/lead.controller');

const router = express.Router();
const reviewRoles = ['operator', 'government_admin', 'viewer'];

router.post('/', createLeadSubmissionHandler);
router.get('/', requireAuth, requireRole(reviewRoles), listLeadSubmissionsHandler);
router.patch(
  '/:leadId/status',
  requireAuth,
  requireRole(reviewRoles),
  updateLeadSubmissionStatusHandler
);

module.exports = router;
