// server/src/index.js

import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path'; // Import path to serve static files
import logger from './util/logger.js';
import config from './config.js';
import authMiddleware from './auth/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import UserRoutes from './routes/userRoutes.js';
import ApiRoutes from './routes/api.js';
import OrganizationRoutes from './routes/organizationRoutes.js';
import SubscriptionRoutes from './routes/subscriptionRoutes.js';
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
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:9000'];

const corsOptions = {
  origin: allowedOrigins,
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register all routes
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/auth', authRoutes);
app.use('/auth-ping', authMiddleware, (req, res) => {
  logger.info(`Auth-ping success for user: ${req.user.email}`);
  res.send('connected');
});
app.use('/user', authMiddleware, UserRoutes);
app.use('/api', authMiddleware, ApiRoutes);
app.use('/organization', authMiddleware, OrganizationRoutes);
app.use('/subscription', authMiddleware, SubscriptionRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Catch-all handler: for any request that doesn't match an API route, send back the React app's index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error occurred: ${err.message}`);
  res.status(422).json({ error: err.message });
});

// Use the dynamic port assigned by Render
const port = process.env.PORT;
app.listen(port, () => {
  logger.info(`Server listening on port: ${port}`);
});