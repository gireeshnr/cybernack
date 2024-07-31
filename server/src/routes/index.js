const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const organizationRoutes = require('./organizationRoutes');
const discoveryRoutes = require('./discovery'); // Updated line

router.use('/auth', authRoutes);
router.use('/organization', organizationRoutes);
router.use('/discovery', discoveryRoutes); // Updated line

module.exports = router;
