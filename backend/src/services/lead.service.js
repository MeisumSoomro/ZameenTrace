const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const LEADS_FILE = path.join(DATA_DIR, 'lead-submissions.json');

const allowedLeadTypes = ['waitlist', 'developer', 'enterprise'];

function createBadRequestError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

async function readLeads() {
  try {
    const raw = await fs.readFile(LEADS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function writeLeads(leads) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(LEADS_FILE, `${JSON.stringify(leads, null, 2)}\n`);
}

function normalizeFields(fields = {}) {
  return Object.fromEntries(
    Object.entries(fields)
      .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
      .filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );
}

function validateLead(type, fields) {
  if (!allowedLeadTypes.includes(type)) {
    throw createBadRequestError(
      `type must be one of: ${allowedLeadTypes.join(', ')}.`
    );
  }

  const requiredByType = {
    waitlist: ['fullName', 'phone'],
    developer: ['name', 'email'],
    enterprise: ['name', 'organization', 'email'],
  };

  const missing = requiredByType[type].filter((field) => !fields[field]);
  if (missing.length > 0) {
    throw createBadRequestError(`Missing required fields: ${missing.join(', ')}.`);
  }
}

async function createLeadSubmission(payload, requestMeta = {}) {
  const type = payload.type || payload.formType;
  const fields = normalizeFields(payload.fields || {});

  validateLead(type, fields);

  const submission = {
    id: crypto.randomUUID(),
    type,
    fields,
    status: 'new',
    source: requestMeta.source || 'website',
    userAgent: requestMeta.userAgent || null,
    createdAt: new Date().toISOString(),
  };

  const leads = await readLeads();
  leads.unshift(submission);
  await writeLeads(leads);

  return submission;
}

async function listLeadSubmissions(filters = {}) {
  const leads = await readLeads();
  const { type, status } = filters;

  return leads.filter((lead) => {
    if (type && lead.type !== type) return false;
    if (status && lead.status !== status) return false;
    return true;
  });
}

async function updateLeadSubmissionStatus(id, status) {
  const allowedStatuses = ['new', 'reviewed', 'contacted', 'archived'];
  if (!allowedStatuses.includes(status)) {
    throw createBadRequestError(
      `status must be one of: ${allowedStatuses.join(', ')}.`
    );
  }

  const leads = await readLeads();
  const lead = leads.find((item) => item.id === id);

  if (!lead) {
    const error = new Error('Lead submission not found.');
    error.statusCode = 404;
    throw error;
  }

  lead.status = status;
  lead.updatedAt = new Date().toISOString();
  await writeLeads(leads);

  return lead;
}

module.exports = {
  createLeadSubmission,
  listLeadSubmissions,
  updateLeadSubmissionStatus,
};
