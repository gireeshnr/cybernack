import express from 'express';
import {
  getOrganizationById,
  createOrganization,
  getAllOrganizations,
  deleteOrganization,
  deleteOrganizations,
  updateOrganization,
} from '../controllers/organizationController.js';
import { authMiddleware } from '../auth/authMiddleware.js';
import { allowRoles } from '../auth/rbacMiddleware.js';

const router = express.Router();

// Fetch organization by ID
router.get('/:orgId', authMiddleware, getOrganizationById);

// Create a new organization (restricted to 'superadmin' role)
router.post('/create', authMiddleware, allowRoles('superadmin'), createOrganization);

// Fetch all organizations (restricted to 'superadmin' role)
router.get('/', authMiddleware, allowRoles('superadmin'), getAllOrganizations);

// Update organization details (restricted to 'superadmin' role)
router.post('/update', authMiddleware, allowRoles('superadmin'), updateOrganization);

// Delete a single organization by ID (restricted to 'superadmin' role)
router.delete('/:orgId', authMiddleware, allowRoles('superadmin'), deleteOrganization);

// Delete multiple organizations (restricted to 'superadmin' role)
router.post('/delete', authMiddleware, allowRoles('superadmin'), deleteOrganizations);

export default router;