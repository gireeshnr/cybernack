import express from 'express';
import {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';
import { authMiddleware, isSuperAdmin } from '../auth/authMiddleware.js';

const router = express.Router();

// CRUD endpoints
router.post('/', authMiddleware, isSuperAdmin, createSubject);
router.get('/', authMiddleware, isSuperAdmin, getSubjects);
router.put('/:id', authMiddleware, isSuperAdmin, updateSubject);
router.delete('/:id', authMiddleware, isSuperAdmin, deleteSubject);

export default router;
