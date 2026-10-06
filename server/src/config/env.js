const dotenv = require('dotenv');
const path = require('path');

// Load from server/.env first; if not found try parent directory
const serverEnvPath = path.resolve(__dirname, '../../.env');
const rootEnvPath = path.resolve(__dirname, '../../../.env');
if (require('fs').existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else {
  dotenv.config({ path: rootEnvPath });
}

const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meetingmind',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_meetingmind_2026',
  AI_API_KEY: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

module.exports = config;
