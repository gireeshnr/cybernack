// server/src/routes/roleRoutes.js

import express from 'express';
import { authMiddleware, isSuperAdmin } from '../auth/authMiddleware.js';
import { allowRoles } from '../auth/rbacMiddleware.js';
import roleController from '../controllers/roleController.js';

const router = express.Router();

// GET is allowed for superadmin or admin
router.get('/', authMiddleware, allowRoles('superadmin', 'admin'), roleController.getRoles);

// Create/Update/Delete remain superadmin only
router.post('/', authMiddleware, allowRoles('superadmin', 'admin'), roleController.createRole);
router.put('/:id', authMiddleware, allowRoles('superadmin', 'admin'), roleController.updateRole);
router.delete('/:id', authMiddleware, allowRoles('superadmin', 'admin'), roleController.deleteRole);

export default router;