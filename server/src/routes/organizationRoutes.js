import express from 'express';
import {
  getOrganizationById,
  createOrganization,
  getAllOrganizations,
  updateOrganization,
  deleteOrganization,      // SINGLE ORG
  deleteOrganizations,     // MULTIPLE ORGS
  upgradeSubscription,
  cancelSubscription,
} from '../controllers/organizationController.js';
import { authMiddleware } from '../auth/authMiddleware.js';
import { allowRoles } from '../auth/rbacMiddleware.js';

const router = express.Router();

// Single org
router.get('/:orgId', authMiddleware, getOrganizationById);

// Create (superadmin)
router.post('/create', authMiddleware, allowRoles('superadmin'), createOrganization);

// All orgs
router.get('/', authMiddleware, allowRoles('superadmin'), getAllOrganizations);

// Update (superadmin)
router.post('/update', authMiddleware, allowRoles('superadmin'), updateOrganization);

// Delete single org (superadmin)
router.delete('/:orgId', authMiddleware, allowRoles('superadmin'), deleteOrganization);

// Delete multiple orgs (superadmin)
router.post('/delete', authMiddleware, allowRoles('superadmin'), deleteOrganizations);

/**************************************************************
 * NEW Routes: Upgrade & Cancel Subscription
 **************************************************************/
router.post(
  '/upgrade-subscription',
  authMiddleware,
  allowRoles('admin', 'superadmin'),
  upgradeSubscription
);

router.post(
  '/cancel-subscription',
  authMiddleware,
  allowRoles('admin', 'superadmin'),
  cancelSubscription
);

export default router;