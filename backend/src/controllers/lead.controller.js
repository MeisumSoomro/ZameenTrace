const {
  createLeadSubmission,
  listLeadSubmissions,
  updateLeadSubmissionStatus,
} = require('../services/lead.service');

async function createLeadSubmissionHandler(req, res, next) {
  try {
    const submission = await createLeadSubmission(req.body, {
      source: req.body?.source || 'website',
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      message: 'Submission received.',
      submission,
    });
  } catch (error) {
    next(error);
  }
}

async function listLeadSubmissionsHandler(req, res, next) {
  try {
    const submissions = await listLeadSubmissions(req.query);

    res.json({
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    next(error);
  }
}

async function updateLeadSubmissionStatusHandler(req, res, next) {
  try {
    const submission = await updateLeadSubmissionStatus(
      req.params.leadId,
      req.body.status
    );

    res.json({ submission });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createLeadSubmissionHandler,
  listLeadSubmissionsHandler,
  updateLeadSubmissionStatusHandler,
};
