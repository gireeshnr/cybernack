// server/src/routes/questionRoutes.js
import express from 'express';
import {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController.js';
import { authMiddleware } from '../auth/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createQuestion);
router.get('/', authMiddleware, getQuestions);
router.put('/:id', authMiddleware, updateQuestion);
router.delete('/:id', authMiddleware, deleteQuestion);

export default router;