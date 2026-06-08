const {
  createParcel,
  getParcelByIdentifier,
  updateParcelBoundary,
  verifyParcel,
  listParcelsByRegion,
} = require('../services/parcel.service');

async function createParcelHandler(req, res, next) {
  try {
    const result = await createParcel(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function getParcelHandler(req, res, next) {
  try {
    const result = await getParcelByIdentifier(req.params.parcelId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function updateParcelBoundaryHandler(req, res, next) {
  try {
    const result = await updateParcelBoundary(req.params.parcelId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function verifyParcelHandler(req, res, next) {
  try {
    const result = await verifyParcel(req.params.parcelId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

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
