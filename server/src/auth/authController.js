import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.js';
import Organization from '../models/Organization.js';
import Subscription from '../models/Subscription.js';
import config from '../config.js';
import { sendPasswordResetEmail, sendActivationEmail } from '../services/emailService.js';

const generateToken = (user) => {
  console.log(`Generating token for user: ${user.email}`);
  return jwt.sign({ id: user._id, email: user.email, org: user.org }, config.jwt_secret, { expiresIn: '1h' });
};

// Fetch the user profile, now including the organization name
export const getUserProfile = async (req, res) => {
  console.log('Fetching user profile for ID:', req.user.id);
  try {
    const profile = await User.findById(req.user.id).populate('org', 'name');
    if (!profile) {
      console.error('User not found during profile fetch');
      return res.status(404).send('User not found');
    }
    console.log('Profile fetched successfully:', profile);
    res.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('Error fetching user profile');
  }
};

// Sign-in functionality
export const signin = async (req, res) => {
  const { email, password } = req.body;
  console.log('Sign-in attempt with email:', email);

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.warn('User not found:', email);
      return res.status(401).send('Invalid email or password');
    }

    if (!user.isActive) {
      console.warn('Account not activated:', email);
      return res.status(401).send('Account not activated. Please check your email to activate your account.');
    }

    // Log provided and stored passwords for comparison (hashed and input)
    console.log(`Provided password for comparison: ${password}`);
    console.log(`Stored (hashed) password: ${user.password}`);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password comparison result: ${isMatch}`);

    // Debugging code for re-hashing the password and comparing hashes
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error re-hashing provided password:', err);
      } else {
        console.log('Re-hashed provided password for consistency check:', hashedPassword);
        bcrypt.compare(password, hashedPassword, (compareErr, result) => {
          if (compareErr) {
            console.error('Error comparing re-hashed password:', compareErr);
          } else {
            console.log('Direct comparison result with re-hashed password:', result);
          }
        });
      }
    });

    if (!isMatch) {
      console.warn('Password does not match for email:', email);
      return res.status(401).send('Invalid email or password');
    }

    const token = generateToken(user);
    console.log('Sign-in successful, token generated for user:', email);
    res.json({ token });
  } catch (error) {
    console.error('Error during sign-in:', error);
    res.status(500).send('Server error');
  }
};

// Account activation and password setting (single hashing)
export const activateAccount = async (req, res) => {
  const { token, password } = req.body;
  console.log('Account activation attempt with token:', token);

  if (!token || !password) {
    return res.status(400).send('Token and password are required');
  }

  try {
    const decoded = jwt.verify(token, config.jwt_secret);
    console.log('Token decoded successfully for activation:', decoded.email);
    const user = await User.findOne({ email: decoded.email, activationToken: token });
    if (!user || !user.activationToken) {
      console.warn('Invalid or expired activation token for email:', decoded.email);
      return res.status(400).send('Invalid or expired token');
    }

    user.password = await bcrypt.hash(password, 12);
    user.isActive = true;
    user.activationToken = null;

    await user.save();
    console.log('Account activated successfully for user:', decoded.email);
    res.status(200).send('Account activated successfully');
  } catch (error) {
    console.error('Error activating account:', error);
    res.status(500).send('Error activating account');
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log('Forgot password request for email:', email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.warn('No account found for email during forgot password:', email);
      return res.status(404).send('No account with that email found.');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();
    await sendPasswordResetEmail(user.email, resetToken);
    console.log('Password reset email sent successfully to:', email);
    res.status(200).send('Password reset email sent.');
  } catch (error) {
    console.error('Error during forgot password:', error);
    res.status(500).send('Server error');
  }
};

// Reset password (single hashing)
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  console.log('Reset password attempt with token:', token);

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.warn('Invalid or expired reset token for password reset');
      return res.status(400).send('Password reset token is invalid or has expired.');
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    console.log('Password has been reset successfully for user:', user.email);
    res.status(200).send('Password has been reset successfully.');
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).send('Error resetting password');
  }
};

// Sign-up functionality
export const signup = async (req, res) => {
  const { email, firstName, lastName, org } = req.body;
  console.log('Signup attempt for email:', email);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn('User already exists:', email);
      return res.status(400).send('User already exists');
    }

    const existingOrg = await Organization.findOne({ name: org });
    if (existingOrg) {
      console.warn('Organization already exists:', org);
      return res.status(400).send('Organization already exists. Contact your admin for access.');
    }

    const defaultSubscription = await Subscription.findOne({ name: 'Free' });
    if (!defaultSubscription) {
      console.error('Default subscription not found.');
      return res.status(400).send('Default subscription not found. Contact support.');
    }

    const organization = new Organization({ name: org, subscription: defaultSubscription._id });
    await organization.save();
    console.log('New organization created:', org);

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
    console.log('User created and activation email sent:', email);

    res.status(200).send('User created successfully. Activation email sent.');
  } catch (error) {
    console.error('Server error during signup:', error);
    res.status(500).send('Server error during signup. Please try again.');
  }
};

// Token refresh
export const refreshToken = async (req, res) => {
  const { token } = req.body;
  console.log('Token refresh attempt');

  try {
    const decoded = jwt.verify(token, config.jwt_secret, { ignoreExpiration: true });
    console.log('Token decoded successfully for refresh:', decoded.email);
    const user = await User.findById(decoded.id);
    if (!user) {
      console.warn('User not found during token refresh:', decoded.id);
      return res.status(401).json({ error: 'User not found' });
    }
    const newToken = generateToken(user);
    console.log('New token generated for user:', user.email);
    res.json({ token: newToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(400).json({ error: 'Invalid token' });
  }
};