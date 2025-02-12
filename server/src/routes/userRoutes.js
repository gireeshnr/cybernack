// server/src/routes/userRoutes.js
import express from 'express';
import UserController from '../user/controller.js';
import { authMiddleware } from '../auth/authMiddleware.js';
import { getUserProfile } from '../auth/authController.js';

const router = express.Router();

/**
 *  GET /user/profile
 *  -> Uses getUserProfile to return both "org" (string)
 *     and "organization" (object) in the same JSON.
 */
router.get('/profile', authMiddleware, getUserProfile);

// Keep the rest of your user-related routes:
router.post('/profile', authMiddleware, UserController.updateProfile);
router.post('/add', authMiddleware, UserController.addUser);
router.post('/update/:userId', authMiddleware, UserController.updateUser);
router.get('/list', authMiddleware, UserController.getUsers);
router.post('/delete', authMiddleware, UserController.deleteUsers);
router.get('/organization/:orgId', authMiddleware, UserController.getOrganizationById);

export default router;