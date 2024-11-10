import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.js';
import Organization from '../models/Organization.js';
import Subscription from '../models/Subscription.js';
import config from '../config.js';
import { sendPasswordResetEmail, sendActivationEmail } from '../services/emailService.js';

const SALT_ROUNDS = 12;

const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, org: user.org }, config.jwt_secret, { expiresIn: '1h' });
};

export const getUserProfile = async (req, res) => {
  try {
    const profile = await User.findById(req.user.id).populate('org', 'name');
    if (!profile) {
      return res.status(404).send('User not found');
    }
    res.json(profile);
  } catch (error) {
    res.status(500).send('Error fetching user profile');
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).send('Invalid email or password');
    }

    if (!user.isActive) {
      return res.status(401).send('Account not activated. Please check your email to activate your account.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Invalid email or password');
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

export const activateAccount = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    logger.error('Token or password missing in request body');
    return res.status(400).send('Token and password are required');
  }

  try {
    const decoded = jwt.verify(token, config.jwt_secret);
    logger.debug('Token decoded successfully:', decoded);

    const user = await User.findOne({ email: decoded.email, activationToken: token });
    if (!user || !user.activationToken) {
      logger.warn('Invalid or expired token');
      return res.status(400).send('Invalid or expired token');
    }

    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    user.isActive = true;
    user.activationToken = null;

    await user.save();
    logger.info(`User ${user.email} activated successfully`);
    res.status(200).send('Account activated successfully');
  } catch (error) {
    logger.error('Error during account activation:', error);
    res.status(500).send('Error activating account');
  }
};

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
    res.status(500).send('Server error');
  }
};

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

    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).send('Password has been reset successfully.');
  } catch (error) {
    res.status(500).send('Error resetting password');
  }
};

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

    const defaultSubscription = await Subscription.findOne({ name: 'Free' });
    if (!defaultSubscription) {
      return res.status(400).send('Default subscription not found. Contact support.');
    }

    const organization = new Organization({ name: org, subscription: defaultSubscription._id });
    await organization.save();

    const activationToken = jwt.sign({ email }, config.jwt_secret, { expiresIn: '24h' });

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
    res.status(500).send('Server error during signup. Please try again.');
  }
};

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