// server/src/routes/contentRoutes.js
import express from 'express';
import { authMiddleware } from '../auth/authMiddleware.js';
import { getCombinedContent } from '../controllers/contentController.js';

const router = express.Router();

router.get('/', authMiddleware, getCombinedContent);

export default router;