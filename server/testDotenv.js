import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Manually define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('DB_URI:', process.env.DB_URI);
