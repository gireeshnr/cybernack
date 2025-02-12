import jwt from 'jsonwebtoken';
import config from '../config.js';
import User from '../models/user.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    console.error('No authorization header provided'); // Debug
    return res.status(401).send({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, config.jwt_secret);
    const user = await User.findById(decoded.id).select('email role org');
    if (!user) {
      console.error('User not found'); // Debug
      return res.status(401).send({ error: 'User not found.' });
    }

    console.log('Authenticated user:', user); // Debug: Log authenticated user
    req.user = {
      id: user._id,
      email: user.email,
      org: user.org,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Invalid token:', error); // Debug
    return res.status(400).send({ error: 'Invalid token.' });
  }
};

export const isSuperAdmin = (req, res, next) => {
  console.log('Role check:', req.user?.role); // Debug
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).send({ error: 'Access denied. Super Admin only.' });
  }
};

export { authMiddleware };