import express from 'express';
import { signup, signin, activateAccount, forgotPassword, resetPassword } from '../auth/authController.js';

const router = express.Router();

// Signup route
router.post('/signup', signup);

// Signin route
router.post('/signin', signin);

// Account activation route
router.post('/activate-account', activateAccount);

// Forgot password route
router.post('/forgot-password', forgotPassword);

// Reset password route
router.post('/reset-password', resetPassword);

export default router;