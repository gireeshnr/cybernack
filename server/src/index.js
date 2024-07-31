import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cors from 'cors';
import logger from './util/logger.js';
import config from './config.js';
import authMiddleware from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import UserRouter from './user/router.js';
import AssetRoutes from './routes/assets.js';
import ApiRoutes from './routes/api.js';
import OrganizationRoutes from './routes/organizationRoutes.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

if (!config.jwt_secret) {
  const err = new Error('No JWT_SECRET in env variable');
  logger.warn(err.message);
}

const app = express();

// Set the useFindAndModify option globally
mongoose.set('useFindAndModify', false);

mongoose.connect(config.mongoose.uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .catch(err => console.error(err));

mongoose.Promise = global.Promise;

app.use(cors({
  origin: 'http://localhost:9000',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get('/ping', (req, res) => res.send('pong'));
app.get('/', (req, res) => res.json({ source: 'https://github.com/amazingandyyy/mern' }));
app.use('/auth', authRoutes);
app.use('/auth-ping', authMiddleware, (req, res) => res.send('connected'));
app.use('/user', authMiddleware, UserRouter);
app.use('/api/assets', authMiddleware, AssetRoutes);
app.use('/api', authMiddleware, ApiRoutes);
app.use('/api/organization', authMiddleware, OrganizationRoutes);

app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(422).json(err.message);
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  logger.info(`Server listening on: ${port}`);
});
