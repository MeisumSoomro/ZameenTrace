// backend/src/routes/api.js
// Updated API routes with proper endpoints

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');

// Auth routes
router.post('/auth/login', require('../controllers/auth.controller').login);
router.post('/auth/signup', require('../controllers/auth.controller').signup);
router.post('/auth/refresh', auth, require('../controllers/auth.controller').refreshToken);

// Parcel routes
router.post('/parcels', auth, require('../controllers/parcel.controller').createParcel);
router.get('/parcels/:parcelId', auth, require('../controllers/parcel.controller').getParcel);
router.get('/parcels', auth, require('../controllers/parcel.controller').searchParcels);
router.put('/parcels/:parcelId/boundary', auth, require('../controllers/parcel.controller').updateBoundary);
router.post('/parcels/:parcelId/verify', auth, require('../controllers/parcel.controller').verifyParcel);

// Report routes
router.get('/reports/parcel/:parcelId', auth, require('../controllers/report.controller').generateReport);
router.get('/reports/history/:parcelId', auth, require('../controllers/report.controller').getHistory);

// Dashboard routes
router.get('/dashboard/stats', auth, require('../controllers/dashboard.controller').getStats);
router.get('/dashboard/alerts', auth, require('../controllers/dashboard.controller').getAlerts);

// Market routes
router.get('/market/trends', auth, require('../controllers/market.controller').getTrends);
router.get('/market/comparable/:parcelId', auth, require('../controllers/market.controller').getComparables);

// User routes
router.get('/user/profile', auth, require('../controllers/user.controller').getProfile);
router.put('/user/profile', auth, require('../controllers/user.controller').updateProfile);
router.get('/user/properties', auth, require('../controllers/user.controller').getUserProperties);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'zameentrace-api',
  });
});

module.exports = router;
