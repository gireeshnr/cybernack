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
import domainRoutes from './routes/domainRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import bulkUploadRoutes from './routes/bulkUploadRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import trainingPathRoutes from './routes/trainingPathRoutes.js';
// Removed: clientTrainingPathRoutes, ClientquestionsRoutes, ClientSubjectsRoutes, ClientIndustriesRoutes, ClientDomainsRoutes
import contentRoutes from './routes/contentRoutes.js';

import dotenv from 'dotenv';
dotenv.config();

if (!config.jwt_secret) {
  logger.warn('⚠️ No JWT_SECRET found in environment variables');
}

const app = express();

if (!config.mongoose.uri) {
  logger.error('❌ Missing MongoDB connection URI in config');
  process.exit(1);
}

mongoose
  .connect(config.mongoose.uri)
  .then(async () => {
    logger.info('✅ Connected to MongoDB successfully');

    const { default: Domain } = await import('./models/Domain.js');
    const { default: Industry } = await import('./models/Industry.js');
    const { default: Subject } = await import('./models/Subject.js');
    const { default: Question } = await import('./models/Question.js');

    await Domain.syncIndexes();
    logger.info('✅ Domain indexes synced');
    await Industry.syncIndexes();
    logger.info('✅ Industry indexes synced');
    await Subject.syncIndexes();
    logger.info('✅ Subject indexes synced');
    await Question.syncIndexes();
    logger.info('✅ Question indexes synced');
  })
  .catch((err) => logger.error('❌ Error connecting to MongoDB:', err));

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
});
mongoose.connection.on('reconnected', () => {
  logger.info('🔄 MongoDB reconnected!');
});

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

app.use(cors(corsOptions));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// -----------------
// Route Registration
// -----------------
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
app.use('/bulk-upload', authMiddleware, bulkUploadRoutes);
app.use('/role', authMiddleware, roleRoutes);
app.use('/training-path', authMiddleware, trainingPathRoutes);
// Removed: client-training-path route
app.use('/content', authMiddleware, contentRoutes);

// Removed the client-questions route since the file has been removed

logger.info('✅ Routes successfully registered');

if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(
    `❌ [${req.method} ${req.originalUrl}] Error: ${err.message}\nStack: ${err.stack}`
  );
  res.status(err.status || 500).json({ error: err.message });
});

const port = process.env.PORT || 8000;
app.listen(port, () => logger.info(`🚀 Server running on port: ${port}`));