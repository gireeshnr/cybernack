// server/src/routes/organizationSettingsRoutes.js
import express from 'express';
import { authMiddleware } from '../auth/authMiddleware.js';
import OrganizationSettingsController from '../controllers/organizationSettingsController.js';

const router = express.Router();

// GET entire Industry->Domain->Subject->Question tree
router.get('/hierarchy', authMiddleware, OrganizationSettingsController.getHierarchy);

// Partial toggles
router.post('/toggle', authMiddleware, OrganizationSettingsController.toggleItem);

// Full doc overwrite if needed
router.post('/hierarchy', authMiddleware, OrganizationSettingsController.updateHierarchy);

export default router;