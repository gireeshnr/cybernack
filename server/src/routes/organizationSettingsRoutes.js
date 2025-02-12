// server/src/routes/organizationSettingsRoutes.js
import express from 'express';
import { authMiddleware } from '../auth/authMiddleware.js';
import OrganizationSettingsController from '../controllers/organizationSettingsController.js';

const router = express.Router();

router.get('/hierarchy', authMiddleware, OrganizationSettingsController.getHierarchy);
router.post('/toggle', authMiddleware, OrganizationSettingsController.toggleItem);
router.post('/hierarchy', authMiddleware, OrganizationSettingsController.updateHierarchy);

export default router;