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

// Debugging logs (optional, remove or comment out in production)
const logEnvVariable = (key) => {
  console.log(`${key}:`, process.env[key] ? 'Loaded' : 'Not Set');
};

const envVariables = [
  'JWT_SECRET', 'DB_URI', 'CENSYS_API_ID', 'CENSYS_API_KEY',
  'GREYNOISE_API_KEY', 'RAPID_DNS_API_KEY', 'SECURITY_TRAILS_API_KEY',
  'VIRUS_TOTAL_API_KEY', 'ZOOM_EYE_API_KEY'
];

console.log('Loaded environment variables in config.js:');
envVariables.forEach(logEnvVariable);

const config = {
  jwt_secret: process.env.JWT_SECRET || 'unsafe_jwt_secret',
  mongoose: {
    uri: process.env.DB_URI || 'mongodb://localhost/mern',
  },
  censysApiID: process.env.CENSYS_API_ID,
  censysApiKey: process.env.CENSYS_API_KEY,
  greyNoiseApiKey: process.env.GREYNOISE_API_KEY,
  rapidDnsApiKey: process.env.RAPID_DNS_API_KEY,
  securityTrailsApiKey: process.env.SECURITY_TRAILS_API_KEY,
  virusTotalApiKey: process.env.VIRUS_TOTAL_API_KEY,
  zoomEyeApiKey: process.env.ZOOM_EYE_API_KEY,
};

export default config;
