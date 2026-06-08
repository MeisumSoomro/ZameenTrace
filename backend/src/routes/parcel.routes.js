const express = require('express');

const { requireAuth } = require('../middleware/auth.middleware');
const {
  createParcelHandler,
  getParcelHandler,
  updateParcelBoundaryHandler,
  verifyParcelHandler,
  listParcelsByRegionHandler,
} = require('../controllers/parcel.controller');

const router = express.Router();

router.get('/', listParcelsByRegionHandler);
router.post('/', requireAuth, createParcelHandler);
router.get('/:parcelId', getParcelHandler);
router.put('/:parcelId/boundary', requireAuth, updateParcelBoundaryHandler);
router.post('/:parcelId/verify', requireAuth, verifyParcelHandler);

module.exports = router;
