const { matchedData } = require('express-validator');
const AssignmentTask = require('../models/AssignmentTask');
const User = require('../models/User');
const Notification = require('../models/Notification');

async function createTask(req, res) {
  const data = matchedData(req);
  const assignedMode = data.assignedMode || 'all_students';
  const studentIds = assignedMode === 'students' ? (data.studentIds || []) : [];

  const task = await AssignmentTask.create({
    title: data.title,
    description: data.description || '',
    subject: data.subject,
    dueDate: data.dueDate || null,
    createdBy: req.user._id,
    assignedTo: { mode: assignedMode, studentIds },
  });

  let recipients = [];
  if (assignedMode === 'students' && studentIds.length) {
    recipients = studentIds;
  } else {
    const students = await User.find({ role: 'student' }).select('_id');
    recipients = students.map((s) => s._id);
  }

  const dueText = task.dueDate ? ` Due: ${new Date(task.dueDate).toISOString().slice(0, 10)}.` : '';
  await Notification.insertMany(
    recipients.map((userId) => ({
      userId,
      title: 'New assignment posted',
      body: `${task.subject}: ${task.title}.${dueText}`,
      type: 'info',
    }))
  );

  res.status(201).json({ task });
}

async function listTasks(req, res) {
  const role = req.user.role;
  if (role === 'student') {
    const items = await AssignmentTask.find({
      status: 'open',
      $or: [{ 'assignedTo.mode': 'all_students' }, { 'assignedTo.studentIds': req.user._id }],
    })
      .sort({ createdAt: -1 })
      .limit(200);
    return res.json({ items });
  }

  // faculty/admin: tasks created by them
  const items = await AssignmentTask.find({ createdBy: req.user._id }).sort({ createdAt: -1 }).limit(200);
  return res.json({ items });
}

module.exports = { createTask, listTasks };

