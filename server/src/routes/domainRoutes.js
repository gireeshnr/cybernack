import express from 'express';
import { authMiddleware } from '../auth/authMiddleware.js';
import domainController from '../controllers/domainController.js';

const router = express.Router();

router.get('/', authMiddleware, domainController.getDomains);
router.post('/', authMiddleware, domainController.createDomain);
router.put('/:id', authMiddleware, domainController.updateDomain);
router.delete('/:id', authMiddleware, domainController.deleteDomain);

export default router;