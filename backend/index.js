const dns = require('dns');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { getConfig } = require('./config/env');
const { connectDb } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

async function main() {
  const config = getConfig();

  if (config.dnsServers?.length) {
    dns.setServers(config.dnsServers);
  }

  const app = express();
  app.set('jwtSecret', config.jwtSecret);
  app.set('jwtExpiresIn', config.jwtExpiresIn);
  app.set('bcryptSaltRounds', config.bcryptSaltRounds);

  const uploadsAbs = path.join(__dirname, config.uploadsDir);
  if (!fs.existsSync(uploadsAbs)) fs.mkdirSync(uploadsAbs, { recursive: true });

  app.use(helmet());
  app.use(compression());
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    cors({
      origin: config.clientOrigin,
      credentials: true,
    })
  );

  app.use('/uploads', express.static(uploadsAbs));

  app.get('/api/health', (req, res) => res.json({ ok: true, name: 'Academic Learning Curve Analyzer API' }));

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 120 });
  app.use('/api/auth', authLimiter, authRoutes);

  app.use('/api/users', userRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/assignments', assignmentRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/notifications', notificationRoutes);

  app.use(notFound);
  app.use(errorHandler);

  await connectDb(config.mongoUri);

  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
