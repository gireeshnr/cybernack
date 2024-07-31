import jwt from 'jsonwebtoken';
import config from '../config.js';
import User from '../models/user.js';

const auth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('Auth Header:', authHeader);

  if (!authHeader) {
    console.error('No token provided.');
    return res.status(401).send({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Token:', token);

  if (!token) {
    console.error('No token provided after replace.');
    return res.status(401).send({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt_secret);
    console.log('Decoded:', decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      console.error('User not found.');
      return res.status(401).send({ error: 'User not found.' });
    }

    req.user = { id: user._id, email: user.email, org: user.org };
    console.log('User set on req:', req.user);

    next();
  } catch (ex) {
    console.error('Token validation failed:', ex);
    res.status(400).send({ error: 'Invalid token.' });
  }
};

export default auth;
