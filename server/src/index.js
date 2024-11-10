// server/src/index.js

import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
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
  logger.info('JWT_SECRET is loaded successfully.');
}

const app = express();

// Updated mongoose connection with logging
mongoose
  .connect(config.mongoose.uri, { useNewUrlParser: true, useUnifiedTopology: true })
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

// CORS setup
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) 
  : ['http://localhost:9000', 'https://app.cybernack.com'];

logger.info('Allowed Origins:', allowedOrigins); // Log for verification

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`Blocked by CORS: Origin ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log all incoming requests with additional details
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  logger.debug('Request Headers:', req.headers);
  next();
});

// API routes with logging
app.use('/auth', (req, res, next) => {
  logger.debug('Auth route accessed');
  next();
}, authRoutes);

app.use('/auth-ping', authMiddleware, (req, res) => {
  logger.info(`Auth-ping success for user: ${req.user.email}`);
  res.send('connected');
});

app.use('/user', authMiddleware, (req, res, next) => {
  logger.debug('User route accessed');
  next();
}, UserRoutes);

app.use('/api', authMiddleware, (req, res, next) => {
  logger.debug('API route accessed');
  next();
}, ApiRoutes);

app.use('/organization', authMiddleware, (req, res, next) => {
  logger.debug('Organization route accessed');
  next();
}, OrganizationRoutes);

app.use('/subscription', authMiddleware, (req, res, next) => {
  logger.debug('Subscription route accessed');
  next();
}, SubscriptionRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Catch-all handler for React app
  app.get('*', (req, res) => {
    logger.debug('Serving React app for route:', req.url);
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Error handling middleware with enhanced logging
app.use((err, req, res, next) => {
  logger.error(`Error occurred: ${err.message}`);
  logger.debug('Stack trace:', err.stack);
  res.status(422).json({ error: err.message });
});

// Use the dynamic port or default to 8000
const port = process.env.PORT || 8000;
app.listen(port, () => {
  logger.info(`Server listening on port: ${port}`);
});