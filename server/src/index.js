import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cors from 'cors';
import logger from './util/logger.js';
import config from './config.js';
import authMiddleware from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import UserRouter from './user/router.js';
import TargetRoutes from './api/targetRoutes.js';
import AssetRoutes from './routes/assets.js';
import OrganizationRoutes from './routes/organizationRoutes.js'; // Import the new organization routes

// Debugging logs
console.log('Loaded environment variables in index.js:');
console.log('JWT_SECRET:', config.jwt_secret);
console.log('DB_URI:', config.mongoose.uri);

if (!config.jwt_secret) {
  const err = new Error('No JWT_SECRET in env variable, check instructions: https://github.com/amazingandyyy/mern#prepare-your-secret');
  logger.warn(err.message);
}

const app = express();

mongoose.connect(config.mongoose.uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .catch(err => console.error(err));

mongoose.Promise = global.Promise;

// App Setup
app.use(cors({
  origin: 'http://localhost:9000', // Allow requests from this origin
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get('/ping', (req, res) => res.send('pong'));
app.get('/', (req, res) => res.json({ 'source': 'https://github.com/amazingandyyy/mern' }));
app.use('/auth', authRoutes);
app.use('/auth-ping', authMiddleware, (req, res) => res.send('connected'));
app.use('/user', authMiddleware, UserRouter);
app.use('/api', TargetRoutes);
app.use('/api/assets', authMiddleware, AssetRoutes);
app.use('/api/organization', authMiddleware, OrganizationRoutes); // Use the new organization routes

app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(422).json(err.message);
});

// Server Setup
const port = process.env.PORT || 8000;
app.listen(port, () => {
  logger.info(`Server listening on: ${port}`);
});
