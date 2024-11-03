// server/src/routes/api.js

import express from 'express';
import authMiddleware from '../auth/authMiddleware.js'; // Corrected import path

const router = express.Router();

// Example user authentication routes (replace with your actual controllers)
// router.post('/signup', signupController);
// router.post('/signin', signinController);
// router.post('/signout', authMiddleware, signoutController);

export default router;