const mongoose = require('mongoose');
const { getConfig } = require('../config/env');
const { connectDb } = require('../config/db');
const User = require('../models/User');

async function run() {
  const config = getConfig();
  await connectDb(config.mongoUri);

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
  const name = process.env.SEED_ADMIN_NAME || 'Admin';

  const existing = await User.findOne({ email });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log('Admin already exists:', existing.email);
    await mongoose.disconnect();
    return;
  }

  const user = new User({ name, email, password, role: 'admin' });
  user.$locals = { bcryptSaltRounds: config.bcryptSaltRounds };
  await user.save();

  // eslint-disable-next-line no-console
  console.log('Seeded admin:', email, 'password:', password);
  await mongoose.disconnect();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

