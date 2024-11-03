import express from 'express';
import UserController from '../user/controller.js';
import authMiddleware from '../auth/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, UserController.getProfile);
router.post('/profile', authMiddleware, UserController.updateProfile);
router.post('/add', authMiddleware, UserController.addUser);
router.post('/update/:userId', authMiddleware, UserController.updateUser); // Route to update a user
router.get('/list', authMiddleware, UserController.getUsers);
router.post('/delete', authMiddleware, UserController.deleteUsers);

router.get('/organization/:orgId', authMiddleware, UserController.getOrganizationById);

export default router;