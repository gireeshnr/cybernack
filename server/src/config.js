// server/src/config.js

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Determine the __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file if not in production
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.resolve(__dirname, '../.env');
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.error(`Error loading .env file at ${envPath}:`, result.error);
  } else {
    console.log(`.env file loaded from ${envPath}`);
  }
}

// Function to safely log presence of environment variables (avoiding values)
const logEnvVariableStatus = (key) => {
  console.log(`${key}:`, process.env[key] ? 'Loaded' : 'Not Set');
};

// List of environment variables to check
const envVariables = ['JWT_SECRET', 'DB_URI', 'CORS_ORIGIN', 'PORT'];

// Log environment variables status (development only)
if (process.env.NODE_ENV !== 'production') {
  console.log('Loaded environment variables in config.js:');
  envVariables.forEach(logEnvVariableStatus);
}

// Error handling if critical variables are missing
if (!process.env.DB_URI) {
  console.error('Error: DB_URI is not set in .env');
}

if (!process.env.JWT_SECRET) {
  console.error('Warning: JWT_SECRET is not set. Using an unsafe default.');
}

const config = {
  jwt_secret: process.env.JWT_SECRET || 'unsafe_jwt_secret',
  mongoose: {
    uri: process.env.DB_URI,
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:9000',
  port: process.env.PORT || 8000,
};

export default config;