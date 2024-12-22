import express from 'express';
import UserController from '../user/controller.js';
import { authMiddleware } from '../auth/authMiddleware.js'; // Named import for authentication middleware

const router = express.Router();

// User profile routes
router.get('/profile', authMiddleware, UserController.getProfile); // Fetch user profile
router.post('/profile', authMiddleware, UserController.updateProfile); // Update user profile

// User management routes
router.post('/add', authMiddleware, UserController.addUser); // Add a new user
router.post('/update/:userId', authMiddleware, UserController.updateUser); // Update user details
router.get('/list', authMiddleware, UserController.getUsers); // List all users
router.post('/delete', authMiddleware, UserController.deleteUsers); // Delete selected users

// Organization-related routes
router.get('/organization/:orgId', authMiddleware, UserController.getOrganizationById); // Fetch organization details by ID

export default router;