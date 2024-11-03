import express from 'express';
import authRoutes from '../auth/authRoutes.js'; 
import organizationRoutes from './organizationRoutes.js';
import userRoutes from './userRoutes.js';  // Updated path for user routes
import discoveryRoutes from './discovery'; 

const router = express.Router();

router.use('/auth', authRoutes); 
router.use('/organization', organizationRoutes);
router.use('/user', userRoutes);  // Now using the relocated user routes
router.use('/discovery', discoveryRoutes);

export default router;