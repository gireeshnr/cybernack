import jwt from 'jsonwebtoken';
import config from '../config.js';
import User from '../models/user.js';

// General authentication middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).send({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, config.jwt_secret);

    const user = await User.findById(decoded.id).select('email role org');
    if (!user) {
      return res.status(401).send({ error: 'User not found.' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      org: user.org,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(400).send({ error: 'Invalid token.' });
  }
};

// Middleware to check if the user is a Super Admin
const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).send({ error: 'Access denied. Super Admin only.' });
  }
};

export { authMiddleware, isSuperAdmin };