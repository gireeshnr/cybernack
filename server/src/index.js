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

dotenv.config();

if (!config.jwt_secret) {
  logger.warn('No JWT_SECRET in env variable');
}

const app = express();

mongoose
  .connect(config.mongoose.uri)
  .then(() => logger.info('Connected to MongoDB successfully'))
  .catch((err) => logger.error('Error connecting to MongoDB:', err));

mongoose.Promise = global.Promise;
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected! Attempting to reconnect...'));
mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected!'));

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:9000', 'https://app.cybernack.com'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
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

// Routes
app.use('/auth', authRoutes);
app.use('/auth-ping', authMiddleware, (req, res) => res.send('connected'));
app.use('/user', authMiddleware, UserRoutes);
app.use('/api', authMiddleware, ApiRoutes);
app.use('/organization', authMiddleware, OrganizationRoutes);
app.use('/subscription', authMiddleware, SubscriptionRoutes);

if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    const filePath = path.join(__dirname, 'client/build', 'index.html');
    res.sendFile(filePath);
  });
}

app.use((err, req, res, next) => {
  logger.error(`Error occurred: ${err.message}`);
  res.status(422).json({ error: err.message });
});

const port = process.env.PORT || 8000;
app.listen(port, () => logger.info(`Server listening on port: ${port}`));