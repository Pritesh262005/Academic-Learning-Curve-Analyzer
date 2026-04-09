const { matchedData } = require('express-validator');
const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');

async function uploadAssignment(req, res) {
  const data = matchedData(req);
  if (!req.file) return res.status(400).json({ message: 'File is required' });

  const assignment = await Assignment.create({
    taskId: data.taskId || null,
    title: data.title,
    description: data.description || '',
    subject: data.subject,
    studentId: req.user._id,
    file: {
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
    },
  });

  res.status(201).json({ assignment });
}

async function listAssignments(req, res) {
  const filter = {};
  if (req.user.role === 'student') filter.studentId = req.user._id;
  const items = await Assignment.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json({ items });
}

async function gradeAssignment(req, res) {
  const data = matchedData(req);
  const { id } = req.params;
  const assignment = await Assignment.findById(id);
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

  assignment.marks = data.marks;
  assignment.feedback = data.feedback || '';
  assignment.status = data.status || 'graded';
  assignment.gradedBy = req.user._id;
  await assignment.save();

  await Notification.create({
    userId: assignment.studentId,
    title: 'Assignment graded',
    body: `${assignment.subject}: ${assignment.marks ?? 0} marks`,
    type: 'success',
  });

  res.json({ assignment });
}

module.exports = { uploadAssignment, listAssignments, gradeAssignment };
