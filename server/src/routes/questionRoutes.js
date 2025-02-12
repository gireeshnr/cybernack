import express from 'express';
import {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController.js';
import { authMiddleware, isSuperAdmin } from '../auth/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, isSuperAdmin, createQuestion);
router.get('/', authMiddleware, isSuperAdmin, getQuestions);
router.put('/:id', authMiddleware, isSuperAdmin, updateQuestion);
router.delete('/:id', authMiddleware, isSuperAdmin, deleteQuestion);

export default router;
