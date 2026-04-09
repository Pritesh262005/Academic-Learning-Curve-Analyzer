const { matchedData } = require('express-validator');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { safePercent } = require('../utils/stats');

function normalizeDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function markAttendance(req, res) {
  const data = matchedData(req);
  const studentUserId = req.params.studentId;
  const day = normalizeDay(data.date || new Date());

  const student = await Student.findOne({ userId: studentUserId });
  if (!student) return res.status(404).json({ message: 'Student record not found' });

  const existingIndex = student.attendance.findIndex((a) => normalizeDay(a.date).getTime() === day.getTime());
  const record = { date: day, status: data.status, markedBy: req.user._id };
  if (existingIndex >= 0) student.attendance[existingIndex] = record;
  else student.attendance.push(record);

  await student.save();

  await Notification.create({
    userId: studentUserId,
    title: 'Attendance updated',
    body: `${day.toISOString().slice(0, 10)}: ${data.status}`,
    type: 'info',
  });

  res.status(201).json({ attendance: student.attendance });
}

async function getAttendance(req, res) {
  const studentUserId = req.params.studentId;
  const student = await Student.findOne({ userId: studentUserId });
  if (!student) return res.status(404).json({ message: 'Student record not found' });
  const presentCount = student.attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const total = student.attendance.length;
  const percentage = safePercent(presentCount, total);
  res.json({ attendance: student.attendance, percentage, presentCount, total });
}

async function getMyAttendance(req, res) {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ message: 'Student record not found' });
  const presentCount = student.attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const total = student.attendance.length;
  const percentage = safePercent(presentCount, total);
  res.json({ attendance: student.attendance, percentage, presentCount, total });
}

module.exports = { markAttendance, getAttendance, getMyAttendance };

