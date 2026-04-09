const { matchedData } = require('express-validator');
const User = require('../models/User');
const Student = require('../models/Student');

async function listUsers(req, res) {
  const { q, role, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);
  res.json({ items: items.map((u) => u.toSafeJSON()), total });
}

async function createUser(req, res) {
  const data = matchedData(req);
  const user = new User({
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
  });
  user.$locals = { bcryptSaltRounds: req.app.get('bcryptSaltRounds') };
  await user.save();
  if (user.role === 'student') {
    await Student.create({ userId: user._id, subjects: data.subjects || [] });
  }
  res.status(201).json({ user: user.toSafeJSON() });
}

async function updateUser(req, res) {
  const data = matchedData(req);
  const { id } = req.params;
  const user = await User.findById(id).select('+password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (data.name !== undefined) user.name = data.name;
  if (data.role !== undefined) user.role = data.role;
  if (data.password) {
    user.password = data.password;
    user.$locals = { bcryptSaltRounds: req.app.get('bcryptSaltRounds') };
  }
  await user.save();

  if (user.role === 'student') {
    await Student.updateOne(
      { userId: user._id },
      { $setOnInsert: { userId: user._id, subjects: data.subjects || [] } },
      { upsert: true }
    );
  }

  res.json({ user: user.toSafeJSON() });
}

async function deleteUser(req, res) {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  await Promise.all([User.deleteOne({ _id: id }), Student.deleteOne({ userId: id })]);
  res.json({ ok: true });
}

module.exports = { listUsers, createUser, updateUser, deleteUser };

