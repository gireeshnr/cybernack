// src/config.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.env.NODE_ENV !== 'production') {
  try {
    const result = dotenv.config({
      path: path.resolve(__dirname, '../.env'), // Adjusted the path
      silent: true
    });
    if (result.error) {
      throw result.error;
    }
  } catch (e) {
    console.error(e.message);
  }
}

// Debugging logs
console.log('Loaded environment variables in config.js:');
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('DB_URI:', process.env.DB_URI);

const config = {
  jwt_secret: process.env.JWT_SECRET || 'unsafe_jwt_secret',
  mongoose: {
    uri: process.env.DB_URI || 'mongodb://localhost/mern'
  }
};

export default config;
