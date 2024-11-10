// server/src/config.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.env.NODE_ENV !== 'production') {
  const envPath = path.resolve(__dirname, '../.env');
  dotenv.config({ path: envPath });
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