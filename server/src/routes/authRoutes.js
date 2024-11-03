import express from 'express';
import { signup, signin, activateAccount, forgotPassword, resetPassword } from '../auth/authController.js';

const router = express.Router();

// Signup route
router.post('/signup', (req, res, next) => {
  console.log('POST /auth/signup route hit');
  next();
}, signup);

// Signin route
router.post('/signin', (req, res, next) => {
  console.log('POST /auth/signin route hit');
  next();
}, signin);

// Account activation route
router.post('/activate-account', (req, res, next) => {
  console.log('POST /auth/activate-account route hit');
  next();
}, activateAccount);

// Forgot password route
router.post('/forgot-password', (req, res, next) => {
  console.log('POST /auth/forgot-password route hit');
  console.log(`Request Body: ${JSON.stringify(req.body)}`);
  next();
}, forgotPassword);

// Reset password route
router.post('/reset-password', (req, res, next) => {
  console.log('POST /auth/reset-password route hit');
  console.log(`Request Body: ${JSON.stringify(req.body)}`);
  next();
}, resetPassword);

export default router;