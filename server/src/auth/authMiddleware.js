// server/src/auth/authMiddleware.js
import jwt from 'jsonwebtoken';
import config from '../config.js';
import User from '../models/user.js';
import Organization from '../models/Organization.js'; // Import the Organization model

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    console.error('No authorization header provided');
    return res.status(401).send({ error: 'Access denied. No token provided.' });
  }

  // Remove the "Bearer " prefix if present
  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, config.jwt_secret);
    // Fetch the user with required fields.
    const user = await User.findById(decoded.id).select('email role org');
    if (!user) {
      console.error('User not found');
      return res.status(401).send({ error: 'User not found.' });
    }

    // Fetch full organization details AND populate the subscription field.
    const organization = await Organization.findById(user.org).populate('subscription');
    if (!organization) {
      console.error('Organization not found');
      return res.status(401).send({ error: 'Organization not found.' });
    }

    console.log('Authenticated user:', user);
    console.log('Organization:', organization);

    // Attach user info to the request; convert role to lowercase for consistency.
    req.user = {
      id: user._id,
      email: user.email,
      org: user.org,
      role: user.role.toLowerCase(),
      organization, // full organization object including subscription details
    };

    next();
  } catch (error) {
    console.error('Invalid token:', error);
    return res.status(400).send({ error: 'Invalid token.' });
  }
};

export const isSuperAdmin = (req, res, next) => {
  console.log('Role check:', req.user?.role);
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).send({ error: 'Access denied. Super Admin only.' });
  }
};

export { authMiddleware };