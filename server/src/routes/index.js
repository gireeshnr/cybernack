import express from 'express';
import authRoutes from '../auth/authRoutes.js';
import organizationRoutes from './organizationRoutes.js';
import userRoutes from './userRoutes.js';
import discoveryRoutes from './discovery.js';

const router = express.Router();

// Mount route modules
router.use('/auth', authRoutes); // Routes for authentication
router.use('/organization', organizationRoutes); // Routes for organization management
router.use('/user', userRoutes); // Routes for user management
router.use('/discovery', discoveryRoutes); // Routes for discovery operations

// Catch-all route for unmatched routes (404)
router.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

export default router;