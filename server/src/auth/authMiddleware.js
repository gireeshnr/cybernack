import jwt from 'jsonwebtoken';
import config from '../config.js';
import User from '../models/user.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).send({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, config.jwt_secret);

    const user = await User.findById(decoded.id).select('email role org password');

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
    res.status(400).send({ error: 'Invalid token.' });
  }
};

export default authMiddleware;