// server/src/routes/trainingPathRoutes.js
import express from 'express';
import { authMiddleware } from '../auth/authMiddleware.js';
import { allowRoles } from '../auth/rbacMiddleware.js';
import trainingPathController from '../controllers/trainingPathController.js';

const router = express.Router();

// Both superadmin + admin can GET, POST, PUT, DELETE training paths
router.get('/', authMiddleware, allowRoles('superadmin', 'admin'), trainingPathController.getTrainingPaths);
router.post('/', authMiddleware, allowRoles('superadmin', 'admin'), trainingPathController.createTrainingPath);
router.put('/:id', authMiddleware, allowRoles('superadmin', 'admin'), trainingPathController.updateTrainingPath);
router.delete('/:id', authMiddleware, allowRoles('superadmin', 'admin'), trainingPathController.deleteTrainingPath);

export default router;