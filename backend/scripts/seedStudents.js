const mongoose = require('mongoose');
const { getConfig } = require('../config/env');
const { connectDb } = require('../config/db');
const User = require('../models/User');
const Student = require('../models/Student');

function parseSubjects() {
  const raw = process.env.SEED_STUDENT_SUBJECTS || 'Mathematics,Physics,Chemistry,DBMS,OS';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function run() {
  const config = getConfig();
  await connectDb(config.mongoUri);

  const count = Number(process.env.SEED_STUDENT_COUNT || 5);
  const password = process.env.SEED_STUDENT_PASSWORD || 'Student@12345';
  const domain = process.env.SEED_STUDENT_DOMAIN || 'demo.edu';
  const namePrefix = process.env.SEED_STUDENT_NAME_PREFIX || 'Student';
  const emailPrefix = process.env.SEED_STUDENT_EMAIL_PREFIX || 'student';
  const subjects = parseSubjects();

  const created = [];
  const skipped = [];

  for (let i = 1; i <= count; i += 1) {
    const email = `${emailPrefix}${i}@${domain}`.toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
      skipped.push(email);
      await Student.updateOne(
        { userId: existing._id },
        { $setOnInsert: { userId: existing._id, subjects } },
        { upsert: true }
      );
      continue;
    }

    const user = new User({ name: `${namePrefix} ${i}`, email, password, role: 'student' });
    user.$locals = { bcryptSaltRounds: config.bcryptSaltRounds };
    await user.save();
    await Student.create({ userId: user._id, subjects });
    created.push({ email, password });
  }

  // eslint-disable-next-line no-console
  console.log(`Seed students done. Created: ${created.length}, Skipped(existing): ${skipped.length}`);
  if (created.length) {
    // eslint-disable-next-line no-console
    console.log('Created accounts:');
    created.forEach((c) => console.log(`- ${c.email} / ${c.password}`));
  }
  await mongoose.disconnect();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

