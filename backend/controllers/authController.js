const jwt = require('jsonwebtoken');
const { matchedData } = require('express-validator');
const User = require('../models/User');
const Student = require('../models/Student');

function signToken({ userId, jwtSecret, expiresIn }) {
  return jwt.sign({}, jwtSecret, { subject: userId.toString(), expiresIn });
}

async function register(req, res) {
  const data = matchedData(req);
  const requester = req.user || null;

  const requestedRole = (data.role || 'student').toLowerCase();
  const role = requester?.role === 'admin' ? requestedRole : 'student';

  const user = new User({
    name: data.name,
    email: data.email,
    password: data.password,
    role,
  });
  user.$locals = { bcryptSaltRounds: req.app.get('bcryptSaltRounds') };
  await user.save();

  if (user.role === 'student') {
    await Student.create({ userId: user._id, subjects: data.subjects || [] });
  }

  const token = signToken({
    userId: user._id,
    jwtSecret: req.app.get('jwtSecret'),
    expiresIn: req.app.get('jwtExpiresIn'),
  });

  res.status(201).json({ token, user: user.toSafeJSON() });
}

async function login(req, res) {
  const data = matchedData(req);
  const user = await User.findOne({ email: data.email }).select('+password');
  if (!user) return res.status(400).json({ message: 'Invalid email or password' });

  const ok = await user.comparePassword(data.password);
  if (!ok) return res.status(400).json({ message: 'Invalid email or password' });

  const token = signToken({
    userId: user._id,
    jwtSecret: req.app.get('jwtSecret'),
    expiresIn: req.app.get('jwtExpiresIn'),
  });

  res.json({ token, user: user.toSafeJSON() });
}

async function me(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}

module.exports = { register, login, me };

