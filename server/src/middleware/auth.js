import jwt from 'jsonwebtoken';
import config from '../config.js';
import User from '../models/user.js'; // Ensure correct import

const auth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('Auth Header:', authHeader); // Debugging statement

  if (!authHeader) {
    return res.status(401).send({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Token:', token); // Debugging statement

  if (!token) {
    return res.status(401).send({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt_secret);
    console.log('Decoded:', decoded); // Debugging statement

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).send({ error: 'User not found.' });
    }

    req.user = { id: user._id, email: user.email, org: user.org }; // Ensure the correct properties are set
    console.log('User set on req:', req.user);

    next();
  } catch (ex) {
    console.log('Token validation failed:', ex); // Debugging statement
    res.status(400).send({ error: 'Invalid token.' });
  }
};

export default auth;
