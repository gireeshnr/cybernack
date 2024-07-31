// server/src/util/db.js

import mongoose from 'mongoose';
import config from '../config.js';
import logger from './logger.js';

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoose.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
