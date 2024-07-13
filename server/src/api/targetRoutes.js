import express from 'express';
import { addTarget, getTargets } from '../controllers/targetController.js';

const router = express.Router();

router.post('/targets', addTarget);
router.get('/targets', getTargets);

export default router;
