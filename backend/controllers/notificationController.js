const Notification = require('../models/Notification');
const { matchedData } = require('express-validator');
const User = require('../models/User');

async function listMyNotifications(req, res) {
  const items = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json({ items });
}

async function markRead(req, res) {
  const { id } = req.params;
  const notif = await Notification.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { $set: { read: true } },
    { new: true }
  );
  if (!notif) return res.status(404).json({ message: 'Notification not found' });
  res.json({ notification: notif });
}

async function sendNotification(req, res) {
  const data = matchedData(req);
  const requesterRole = req.user.role;

  const targetMode = data.targetMode;
  const title = data.title;
  const body = data.body || '';
  const type = data.type || 'info';

  let recipientIds = [];

  if (targetMode === 'user') {
    if (requesterRole === 'faculty') {
      const student = await User.findOne({ _id: data.userId, role: 'student' }).select('_id');
      if (!student) return res.status(400).json({ message: 'Faculty can message only students' });
    }
    recipientIds = [data.userId];
  } else if (targetMode === 'role') {
    if (requesterRole !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const users = await User.find({ role: data.role }).select('_id');
    recipientIds = users.map((u) => u._id);
  } else if (targetMode === 'all') {
    if (requesterRole !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const users = await User.find({}).select('_id');
    recipientIds = users.map((u) => u._id);
  } else {
    return res.status(400).json({ message: 'Invalid target mode' });
  }

  await Notification.insertMany(
    recipientIds.map((userId) => ({ userId, title, body, type }))
  );

  res.status(201).json({ ok: true, count: recipientIds.length });
}

module.exports = { listMyNotifications, markRead, sendNotification };
