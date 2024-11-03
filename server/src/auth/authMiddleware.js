import jwt from 'jsonwebtoken';
import config from '../config.js';
import User from '../models/user.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).send({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return res.status(401).send({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt_secret);

    // Fetch the user from the database and include the 'role' field
    const user = await User.findById(decoded.id).select('email role org');

    if (!user) {
      return res.status(401).send({ error: 'User not found.' });
    }

    // Include the role in req.user
    req.user = {
      id: user._id,
      email: user.email,
      org: user.org,
      role: user.role,
    };

    next();
  } catch (error) {
    // Sending a generic error message to avoid exposing sensitive details
    res.status(400).send({ error: 'Invalid token.' });
  }
};

export default authMiddleware;