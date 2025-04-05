// server/src/routes/subjectRoutes.js
import express from 'express';
import { authMiddleware } from '../auth/authMiddleware.js';
import subjectController from '../controllers/subjectController.js';

const router = express.Router();

router.get('/', authMiddleware, subjectController.getSubjects);
router.post('/', authMiddleware, subjectController.createSubject);
router.put('/:id', authMiddleware, subjectController.updateSubject);
router.delete('/:id', authMiddleware, subjectController.deleteSubject);

export default router;