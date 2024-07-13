// src/routes/auth.js
import express from 'express';
import { signin, signup, refreshToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/signin', signin);
router.post('/signup', signup);
router.post('/refresh-token', refreshToken);

export default router;
