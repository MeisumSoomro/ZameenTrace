// backend/src/routes/parcel.routes.js
// Defines the REST endpoints for the parcel workflow.
// These routes are mounted under /api/parcels by the route index.
//
// MVP auth strategy: parcel list and detail are public (no auth required).
// Create, boundary update, and verify use optionalAuth — they work without login
// but will attach user identity if a JWT is provided.

const express = require('express');

const { optionalAuth } = require('../middleware/auth.middleware');
const {
  createParcelHandler,
  getParcelHandler,
  updateParcelBoundaryHandler,
  verifyParcelHandler,
  listParcelsByRegionHandler,
} = require('../controllers/parcel.controller');

const router = express.Router();

// GET /api/parcels?province=Sindh&district=... — list parcels by region filters.
router.get('/', listParcelsByRegionHandler);

// POST /api/parcels — create a new parcel with boundary geometry.
router.post('/', optionalAuth, createParcelHandler);

// GET /api/parcels/:parcelId — get parcel details including versions and approvals.
router.get('/:parcelId', getParcelHandler);

// PUT /api/parcels/:parcelId/boundary — submit a boundary update (creates a new version).
router.put('/:parcelId/boundary', optionalAuth, updateParcelBoundaryHandler);

// POST /api/parcels/:parcelId/verify — submit a verification decision (approve/reject).
router.post('/:parcelId/verify', optionalAuth, verifyParcelHandler);

module.exports = router;
