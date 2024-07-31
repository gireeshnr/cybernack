import express from 'express';
import { getRootDomain } from '../controllers/organizationController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/root-domain', authMiddleware, getRootDomain);

export default router;
