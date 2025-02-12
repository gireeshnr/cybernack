import express from 'express';
import {
  getAllSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscriptions,
} from '../controllers/subscriptionController.js';
import { authMiddleware } from '../auth/authMiddleware.js';
import { allowRoles } from '../auth/rbacMiddleware.js';

const router = express.Router();

/*
  Now allow GET for both 'superadmin' and 'admin'.
  That way, 'admin' can load the subscription data for their org.
  If you only want to give read-access to 'admin', keep create, update, delete for superadmin only.
*/

router.get('/', authMiddleware, allowRoles('superadmin', 'admin'), getAllSubscriptions); // Get all subscriptions

// Keep creation, update, deletion for superadmin only:
router.post('/create', authMiddleware, allowRoles('superadmin'), createSubscription);
router.put('/:subId', authMiddleware, allowRoles('superadmin'), updateSubscription);
router.post('/delete', authMiddleware, allowRoles('superadmin'), deleteSubscriptions);

export default router;