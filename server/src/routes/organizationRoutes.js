import express from 'express';
import {
  getOrganizationById,
  createOrganization,
  getAllOrganizations,
  deleteOrganization,
  deleteOrganizations, // Import the delete multiple organizations function
  updateOrganization, // Import the update organization details function
} from '../controllers/organizationController.js';
import authMiddleware from '../auth/authMiddleware.js';
import { allowRoles } from '../auth/rbacMiddleware.js';

const router = express.Router();

// Route to fetch organization by ID
router.get('/:orgId', authMiddleware, getOrganizationById);

// Route to create a new organization (restricted to 'superadmin' role)
router.post('/create', authMiddleware, allowRoles('superadmin'), createOrganization);

// Route to fetch all organizations (restricted to 'superadmin' role)
router.get('/', authMiddleware, allowRoles('superadmin'), getAllOrganizations);

// Route to update the organization details
router.post('/update', authMiddleware, allowRoles('superadmin'), updateOrganization);

// Route to delete an organization (restricted to 'superadmin' role)
router.delete('/:orgId', authMiddleware, allowRoles('superadmin'), deleteOrganization);

// Route to delete multiple organizations (restricted to 'superadmin' role)
router.post('/delete', authMiddleware, allowRoles('superadmin'), deleteOrganizations);

export default router;