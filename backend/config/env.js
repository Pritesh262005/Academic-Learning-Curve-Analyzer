const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

function getEnv(name, { required = true, fallback } = {}) {
  const value = process.env[name] ?? fallback;
  if (required && (value === undefined || value === '')) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getConfig() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 5000),
    mongoUri: getEnv('MONGO_URI'),
    dnsServers: (process.env.DNS_SERVERS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    jwtSecret: getEnv('JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
    clientOrigin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((s) => s.trim()),
    uploadsDir: process.env.UPLOADS_DIR || 'uploads',
  };
}

module.exports = { getConfig };
