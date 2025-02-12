// server/src/index.js
import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import logger from './util/logger.js';
import config from './config.js';
import { authMiddleware } from './auth/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import UserRoutes from './routes/userRoutes.js';
import ApiRoutes from './routes/api.js';
import OrganizationRoutes from './routes/organizationRoutes.js';
import SubscriptionRoutes from './routes/subscriptionRoutes.js';
import industryRoutes from './routes/industryRoutes.js';

// Domain Routes
import domainRoutes from './routes/domainRoutes.js';

// Subject Routes
import subjectRoutes from './routes/subjectRoutes.js';

// Question Routes
import questionRoutes from './routes/questionRoutes.js';

// Organization Settings Routes
import organizationSettingsRoutes from './routes/organizationSettingsRoutes.js'; // Make sure we import

import dotenv from 'dotenv';
dotenv.config();

// Verify JWT secret
if (!config.jwt_secret) {
  logger.warn('⚠️ No JWT_SECRET found in environment variables');
}

const app = express();

// MongoDB Connection
if (!config.mongoose.uri) {
  logger.error('❌ Missing MongoDB connection URI in config');
  process.exit(1);
}

mongoose
  .connect(config.mongoose.uri)
  .then(() => logger.info('✅ Connected to MongoDB successfully'))
  .catch((err) => logger.error('❌ Error connecting to MongoDB:', err));

mongoose.connection.on('disconnected', () =>
  logger.warn('⚠️ MongoDB disconnected! Attempting to reconnect...')
);
mongoose.connection.on('reconnected', () =>
  logger.info('🔄 MongoDB reconnected!')
);

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:9000', 'https://app.cybernack.com'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`❌ CORS request rejected: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route Registration
app.use('/auth', authRoutes);
app.use('/auth-ping', authMiddleware, (req, res) => res.send('connected'));
app.use('/user', authMiddleware, UserRoutes);
app.use('/api', authMiddleware, ApiRoutes);
app.use('/organization', authMiddleware, OrganizationRoutes);
app.use('/subscription', authMiddleware, SubscriptionRoutes);
app.use('/industry', authMiddleware, industryRoutes);
app.use('/domain', authMiddleware, domainRoutes);
app.use('/subject', authMiddleware, subjectRoutes);
app.use('/question', authMiddleware, questionRoutes);

// Organization Settings Routes
app.use('/organization-settings', authMiddleware, organizationSettingsRoutes);

logger.info('✅ Routes successfully registered');

// Serve Static Files in Production
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, 'client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(
    `❌ [${req.method} ${req.originalUrl}] Error: ${err.message}\nStack: ${err.stack}`
  );
  res.status(err.status || 500).json({ error: err.message });
});

// Start Server
const port = process.env.PORT || 8000;
app.listen(port, () => logger.info(`🚀 Server running on port: ${port}`));