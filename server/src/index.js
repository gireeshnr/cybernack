// server/src/index.js

import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cors from 'cors';
import logger from './util/logger.js';
import config from './config.js';
import authMiddleware from './auth/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';  // Corrected Auth routes path
import UserRoutes from './routes/userRoutes.js';
import ApiRoutes from './routes/api.js';
import OrganizationRoutes from './routes/organizationRoutes.js';
import SubscriptionRoutes from './routes/subscriptionRoutes.js'; // Import subscription routes
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Check if JWT_SECRET is set
if (!config.jwt_secret) {
  const err = new Error('No JWT_SECRET in env variable');
  logger.warn(err.message);
} else {
  logger.info(`JWT_SECRET is loaded successfully.`);
}

const app = express();

// Updated mongoose connection with logging
mongoose
  .connect(config.mongoose.uri)
  .then(() => {
    logger.info('Connected to MongoDB successfully');
  })
  .catch((err) => {
    logger.error('Error connecting to MongoDB:', err);
  });

mongoose.Promise = global.Promise;

// Handle MongoDB disconnections and reconnections
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected! Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected!');
});

// CORS and basic middleware setup
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:9000',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,  // Allow credentials (cookies, authorization headers)
  optionsSuccessStatus: 200,  // For legacy browsers
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Test routes
app.get('/ping', (req, res) => res.send('pong'));
app.get('/', (req, res) => res.json({ source: 'https://github.com/amazingandyyy/mern' }));

// Register all routes
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use('/auth', authRoutes);  // Add auth routes
app.use('/auth-ping', authMiddleware, (req, res) => {
  logger.info(`Auth-ping success for user: ${req.user.email}`);
  res.send('connected');
});
app.use('/user', authMiddleware, UserRoutes);
app.use('/api', authMiddleware, ApiRoutes);
app.use('/organization', authMiddleware, OrganizationRoutes); // Fixed path
app.use('/subscription', authMiddleware, SubscriptionRoutes); // Register subscription routes

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error occurred: ${err.message}`);
  res.status(422).json({ error: err.message });
});

// Start the server and log it
const port = process.env.PORT || 8000;
app.listen(port, () => {
  logger.info(`Server listening on: ${port}`);
});