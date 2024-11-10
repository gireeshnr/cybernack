import jwt from 'jsonwebtoken';
import config from '../config.js';
import User from '../models/user.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('Auth middleware invoked, checking authorization header.');

  if (!authHeader) {
    console.warn('Authorization header missing.');
    return res.status(401).send({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Token extracted:', token);

  try {
    const decoded = jwt.verify(token, config.jwt_secret);
    console.log('Token decoded successfully:', decoded);

    const user = await User.findById(decoded.id).select('email role org password');
    console.log('User found in database:', user);

    if (!user) {
      console.warn('User not found for decoded token ID:', decoded.id);
      return res.status(401).send({ error: 'User not found.' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      org: user.org,
      role: user.role,
    };
    console.log('User authenticated successfully:', user.email);

    next();
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    res.status(400).send({ error: 'Invalid token.' });
  }
};

export default authMiddleware;