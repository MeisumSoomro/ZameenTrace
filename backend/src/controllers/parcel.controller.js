// backend/src/controllers/parcel.controller.js
// Thin controller layer between Express routes and the parcel service.
// Each handler extracts request data, calls the service, and returns the result.
// Error handling is delegated to next() which passes to the error middleware.

const {
  createParcel,
  getParcelByIdentifier,
  updateParcelBoundary,
  verifyParcel,
  listParcelsByRegion,
} = require('../services/parcel.service');

/**
 * POST /api/parcels
 * Receive a parcel creation request from the frontend.
 * Expects: { parcelId, ownerName, province, district, coordinates, ... }
 * Returns: the created parcel and its initial version (201).
 */
async function createParcelHandler(req, res, next) {
  try {
    const result = await createParcel(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/parcels/:parcelId
 * Return a parcel with its full version history and verification approvals.
 * The UI detail panel uses this to show ownership, boundary, and approval state.
 */
async function getParcelHandler(req, res, next) {
  try {
    const result = await getParcelByIdentifier(req.params.parcelId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/parcels/:parcelId/boundary
 * Create a new parcel version when the boundary changes.
 * This preserves history — the old boundary stays in the version table.
 * Expects: { coordinates, ownerName, changeReason, ... }
 */
async function updateParcelBoundaryHandler(req, res, next) {
  try {
    const result = await updateParcelBoundary(req.params.parcelId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/parcels/:parcelId/verify
 * Record a verification decision (approve/reject) from a neighbor or operator.
 * The service recalculates the parcel status based on all current approvals.
 * Expects: { approverUserId, status, relationshipToParcel, comments }
 */
async function verifyParcelHandler(req, res, next) {
  try {
    const result = await verifyParcel(req.params.parcelId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/parcels?province=...&district=...
 * List parcels matching the given region filters.
 * Used by the dashboard parcel list and map view to show relevant records.
 */
async function listParcelsByRegionHandler(req, res, next) {
  try {
    const result = await listParcelsByRegion(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createParcelHandler,
  getParcelHandler,
  updateParcelBoundaryHandler,
  verifyParcelHandler,
  listParcelsByRegionHandler,
};
