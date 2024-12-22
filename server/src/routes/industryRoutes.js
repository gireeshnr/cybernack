import express from 'express';
import {
  createIndustry,
  getIndustries,
  updateIndustry,
  deleteIndustry,
} from '../controllers/industryController.js';
import { authMiddleware, isSuperAdmin } from '../auth/authMiddleware.js';

const router = express.Router();

// CRUD Routes
router.post('/', authMiddleware, isSuperAdmin, createIndustry);
router.get('/', authMiddleware, isSuperAdmin, getIndustries);
router.put('/:id', authMiddleware, isSuperAdmin, updateIndustry);
router.delete('/:id', authMiddleware, isSuperAdmin, deleteIndustry);

export default router;