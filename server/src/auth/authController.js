import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.js';
import Organization from '../models/Organization.js';
import Subscription from '../models/Subscription.js';
import config from '../config.js';
import {
  sendPasswordResetEmail,
  sendActivationEmail,
} from '../services/emailService.js';

const SALT_ROUNDS = 12;

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, org: user.org },
    config.jwt_secret,
    { expiresIn: '1h' }
  );
};

/**
 * GET /user/profile
 * Populates the user's org => subscription
 * Returns:
 *  {
 *    id, email, role, name,
 *    org: "Fedex" (for quick display),
 *    organization: {
 *      _id, name, subscription, isActive, createdAt,
 *      billingTerm, subscriptionStartDate, subscriptionEndDate
 *    }
 *  }
 */
export const getUserProfile = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).populate({
      path: 'org',
      model: 'Organization',
      select:
        'name subscription isActive createdAt billingTerm subscriptionStartDate subscriptionEndDate',
      populate: {
        path: 'subscription',
        model: 'Subscription',
      },
    });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // 1) Check if subscriptionEndDate is in the past => revert to "Free"
    if (
      user.org &&
      user.org.subscriptionEndDate &&
      user.org.subscriptionEndDate < new Date()
    ) {
      const freeSub = await Subscription.findOne({ name: 'Free' });
      if (freeSub) {
        user.org.subscription = freeSub._id;
        user.org.subscriptionEndDate = null;
        user.org.billingTerm = '';
        user.org.subscriptionStartDate = new Date(); // optional
        await user.org.save();
      }
    }

    // 2) Re-populate after a possible revert
    if (user.org) {
      await user.populate({
        path: 'org',
        model: 'Organization',
        populate: { path: 'subscription', model: 'Subscription' },
      });
    }

    // Build final profile
    const profile = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      org: user.org ? user.org.name : null,
      organization: user.org,
    };

    console.log('Debug -> User Profile returned:', profile);
    return res.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).send('Error fetching user profile');
  }
};

/* -------------- No changes to the rest of auth logic except signup -------------- */

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).send('Invalid email or password');
    }

    if (!user.isActive) {
      return res
        .status(401)
        .send(
          'Account not activated. Please check your email to activate your account.'
        );
    }

    const isMatch = await user.comparePassword(password);
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
    return res.status(400).send('Token and password are required');
  }

  try {
    const decoded = jwt.verify(token, config.jwt_secret);
    const user = await User.findOne({ email: decoded.email, activationToken: token });

    if (!user || !user.activationToken) {
      return res.status(400).send('Invalid or expired token');
    }

    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    user.isActive = true;
    user.activationToken = null;

    await user.save();
    res.status(200).send('Account activated successfully');
  } catch (error) {
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
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .send('Password reset token is invalid or has expired.');
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

/**
 * SIGNUP logic with case-insensitive duplicate org check
 * e.g. "Google" vs "google"
 */
export const signup = async (req, res) => {
  const { email, firstName, lastName, org } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    // Trim the org string
    const trimmedOrg = org.trim();

    // Case-insensitive check for existing Org
    const existingOrg = await Organization.findOne({
      name: { $regex: new RegExp(`^${trimmedOrg}$`, 'i') },
    });
    if (existingOrg) {
      return res
        .status(400)
        .send(
          'Organization already exists. Contact your admin for access.'
        );
    }

    // Check default "Free" subscription
    const defaultSubscription = await Subscription.findOne({ name: 'Free' });
    if (!defaultSubscription) {
      return res
        .status(400)
        .send('Default subscription not found. Contact support.');
    }

    // Create new organization
    const organization = new Organization({
      name: trimmedOrg,
      subscription: defaultSubscription._id,
    });
    await organization.save();

    // Activation token for user
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
    console.error('Error during signup:', error);
    res.status(500).send('Server error during signup. Please try again.');
  }
};

export const refreshToken = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, config.jwt_secret, {
      ignoreExpiration: true,
    });

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