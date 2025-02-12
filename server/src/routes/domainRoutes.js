import express from 'express';
import {
  createDomain,
  getDomains,
  updateDomain,
  deleteDomain,
} from '../controllers/domainController.js';
import { authMiddleware, isSuperAdmin } from '../auth/authMiddleware.js';

const router = express.Router();

// CRUD endpoints
router.post('/', authMiddleware, isSuperAdmin, createDomain);
router.get('/', authMiddleware, isSuperAdmin, getDomains);
router.put('/:id', authMiddleware, isSuperAdmin, updateDomain);
router.delete('/:id', authMiddleware, isSuperAdmin, deleteDomain);

export default router;
