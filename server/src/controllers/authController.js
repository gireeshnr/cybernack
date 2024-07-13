import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Organization from '../models/Organization.js';
import config from '../config.js';

const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, org: user.org }, config.jwt_secret, { expiresIn: '1h' });
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found with email: ${email}`);
      return res.status(401).send('Invalid email or password');
    }

    console.log(`User found: ${JSON.stringify(user)}`);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Comparing provided password: ${password} with stored hash: ${user.password}`);
    console.log(`Password match result: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).send('Invalid email or password');
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).send('Server error');
  }
};

export const signup = async (req, res) => {
  const { email, password, firstName, lastName, org } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    const existingOrg = await Organization.findOne({ name: org });
    if (existingOrg) {
      return res.status(400).send('Organization already exists. Contact your admin for access.');
    }

    const organization = new Organization({ name: org });
    await organization.save();

    const user = new User({
      email,
      password, // No need to hash here
      name: { first: firstName, last: lastName },
      org: organization._id,
      role: 'admin' // The first user is the admin
    });

    await user.save();

    const token = generateToken(user);

    res.json({ token });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.name === 'ValidationError') {
      res.status(400).send('Invalid input');
    } else {
      res.status(500).send('Server error');
    }
  }
};

export const refreshToken = async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, config.jwt_secret, { ignoreExpiration: true });
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
