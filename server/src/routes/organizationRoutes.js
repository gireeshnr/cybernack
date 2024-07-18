// server\src\routes\organizationRoutes.js
import express from 'express';
import { getRootDomain } from '../controllers/organizationController.js';
import authMiddleware from '../middleware/auth.js'; // Ensure you have this middleware for authentication

const router = express.Router();

router.get('/root-domain', authMiddleware, getRootDomain);

export default router;
