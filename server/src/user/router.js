import express from 'express';
import UserController from './controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', auth, UserController.getProfile);
router.post('/profile', auth, UserController.updateProfile);

export default router;
