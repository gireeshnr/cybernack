import express from 'express';
import { authMiddleware } from '../auth/authMiddleware.js'; // Updated to use named import

const router = express.Router();

// Example user authentication routes (replace with your actual controllers)
// Replace these placeholders with actual controller functions
// router.post('/signup', signupController);
// router.post('/signin', signinController);
// router.post('/signout', authMiddleware, signoutController);

export default router;