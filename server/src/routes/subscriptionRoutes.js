import express from 'express';
import {
  getAllSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscriptions,
} from '../controllers/subscriptionController.js';
import { authMiddleware } from '../auth/authMiddleware.js'; // Named import for authentication middleware
import { allowRoles } from '../auth/rbacMiddleware.js'; // Role-based access control middleware

const router = express.Router();

// Subscription management routes restricted to 'superadmin'
router.get('/', authMiddleware, allowRoles('superadmin'), getAllSubscriptions); // Get all subscriptions
router.post('/create', authMiddleware, allowRoles('superadmin'), createSubscription); // Create a subscription
router.put('/:subId', authMiddleware, allowRoles('superadmin'), updateSubscription); // Update a subscription
router.post('/delete', authMiddleware, allowRoles('superadmin'), deleteSubscriptions); // Delete subscriptions

export default router;