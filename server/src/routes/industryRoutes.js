// server/src/routes/industryRoutes.js
import express from 'express';
import { authMiddleware } from '../auth/authMiddleware.js';
import industryController from '../controllers/industryController.js';

const router = express.Router();

router.get('/', authMiddleware, industryController.getIndustries);
router.post('/', authMiddleware, industryController.createIndustry);
router.put('/:id', authMiddleware, industryController.updateIndustry);
router.delete('/:id', authMiddleware, industryController.deleteIndustry);

export default router;