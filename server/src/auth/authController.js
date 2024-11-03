import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.js';
import Organization from '../models/Organization.js';
import Subscription from '../models/Subscription.js';
import config from '../config.js';
import { sendPasswordResetEmail, sendActivationEmail } from '../services/emailService.js';

const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, org: user.org }, config.jwt_secret, { expiresIn: '1h' });
};

// Fetch the user profile, now including the organization name
export const getUserProfile = async (req, res) => {
  try {
    const profile = await User.findById(req.user.id).populate('org', 'name');
    if (!profile) {
      return res.status(404).send('User not found');
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('Error fetching user profile');
  }
};

// Sign-in functionality
export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).send('Invalid email or password');
    }

    if (!user.isActive) {
      console.log('Account not activated:', email);
      return res.status(401).send('Account not activated. Please check your email to activate your account.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match:', password);
      return res.status(401).send('Invalid email or password');
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    console.error('Error during sign-in:', error);
    res.status(500).send('Server error');
  }
};

// Account activation and password setting (single hashing)
export const activateAccount = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).send('Token and password are required');
  }

  try {
    const decoded = jwt.verify(token, config.jwt_secret);
    const user = await User.findOne({ email: decoded.email, activationToken: token });
    if (!user || !user.activationToken) {
      return res.status(400).send('Invalid or expired token');
    }

    user.password = password;
    user.isActive = true;
    user.activationToken = null;

    await user.save();
    res.status(200).send('Account activated successfully');
  } catch (error) {
    console.error('Error activating account:', error);
    res.status(500).send('Error activating account');
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('No account with that email found.');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();
    await sendPasswordResetEmail(user.email, resetToken);
    res.status(200).send('Password reset email sent.');
  } catch (error) {
    console.error('Error during forgot password:', error);
    res.status(500).send('Server error');
  }
};

// Reset password (single hashing)
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send('Password reset token is invalid or has expired.');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).send('Password has been reset successfully.');
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).send('Error resetting password');
  }
};

// Sign-up functionality
export const signup = async (req, res) => {
  const { email, firstName, lastName, org } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    const existingOrg = await Organization.findOne({ name: org });
    if (existingOrg) {
      return res.status(400).send('Organization already exists. Contact your admin for access.');
    }

    // Set default subscription for new organizations
    const defaultSubscription = await Subscription.findOne({ name: 'Free' });
    if (!defaultSubscription) {
      return res.status(400).send('Default subscription not found. Contact support.');
    }

    const organization = new Organization({ name: org, subscription: defaultSubscription._id });
    await organization.save();

    const activationToken = jwt.sign({ email }, config.jwt_secret, {
      expiresIn: '24h',
    });

    const user = new User({
      email,
      name: { first: firstName, last: lastName },
      org: organization._id,
      role: 'admin',
      isActive: false,
      activationToken,
    });

    await user.save();
    await sendActivationEmail(user.email, activationToken);

    res.status(200).send('User created successfully. Activation email sent.');
  } catch (error) {
    console.error('Server error during signup:', error);
    res.status(500).send('Server error during signup. Please try again.');
  }
};

// Token refresh
export const refreshToken = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, config.jwt_secret, { ignoreExpiration: true });
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    const newToken = generateToken(user);
    res.json({ token: newToken });
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};