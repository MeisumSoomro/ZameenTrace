// backend/src/routes/index.js
// Central route registry — mounts all API sub-routers under /api.
// For the MVP, only auth, parcels, and users routes are active.
// Report, dashboard, and market routes are deferred per the MVP spec (section 5).

const express = require('express');

const authRoutes = require('./auth.routes');
const parcelRoutes = require('./parcel.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

// Auth routes handle login, registration, and demo session creation.
router.use('/auth', authRoutes);

// Parcel routes are the core MVP workflow — list, detail, create, update boundary, verify.
router.use('/parcels', parcelRoutes);

// User routes provide profile lookup (used after login to display user info).
router.use('/users', userRoutes);

module.exports = router;
