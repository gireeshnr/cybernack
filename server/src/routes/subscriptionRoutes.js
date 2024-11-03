import express from 'express';
import {
  getAllSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscriptions,
} from '../controllers/subscriptionController.js';
import authMiddleware from '../auth/authMiddleware.js';
import { allowRoles } from '../auth/rbacMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, allowRoles('superadmin'), getAllSubscriptions);
router.post('/create', authMiddleware, allowRoles('superadmin'), createSubscription);
router.put('/:subId', authMiddleware, allowRoles('superadmin'), updateSubscription);
router.post('/delete', authMiddleware, allowRoles('superadmin'), deleteSubscriptions);

export default router;