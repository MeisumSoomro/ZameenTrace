const express = require('express');

const authRoutes = require('./auth.routes');
const parcelRoutes = require('./parcel.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/parcels', parcelRoutes);
router.use('/users', userRoutes);

module.exports = router;
