const { matchedData } = require('express-validator');
const Student = require('../models/Student');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { computeSubjectAverages, computeOverallAverage } = require('../utils/stats');

async function getMyStudentDoc(req, res) {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ message: 'Student record not found' });
  res.json({ student });
}

async function listStudents(req, res) {
  const { q, page = 1, limit = 20 } = req.query;
  const userFilter = { role: 'student' };
  if (q) {
    userFilter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const students = await User.find(userFilter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  res.json({ items: students.map((s) => s.toSafeJSON()) });
}

async function addMarks(req, res) {
  const data = matchedData(req);
  const studentUserId = req.params.studentId;

  const student = await Student.findOneAndUpdate(
    { userId: studentUserId },
    {
      $push: {
        marks: {
          subject: data.subject,
          assessment: data.assessment,
          score: data.score,
          maxScore: data.maxScore,
          date: data.date || new Date(),
          enteredBy: req.user._id,
        },
      },
      $addToSet: { subjects: data.subject },
    },
    { new: true, upsert: true }
  );

  await Notification.create({
    userId: studentUserId,
    title: 'New marks added',
    body: `${data.subject}: ${data.score}/${data.maxScore} (${data.assessment || 'Exam'})`,
    type: 'info',
  });

  res.status(201).json({ student });
}

async function getStudentMarks(req, res) {
  const studentUserId = req.params.studentId;
  const student = await Student.findOne({ userId: studentUserId });
  if (!student) return res.status(404).json({ message: 'Student record not found' });
  const subjectAverages = computeSubjectAverages(student.marks);
  const overallAverage = computeOverallAverage(student.marks);
  res.json({ marks: student.marks, subjectAverages, overallAverage });
}

async function getMyMarks(req, res) {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ message: 'Student record not found' });
  const subjectAverages = computeSubjectAverages(student.marks);
  const overallAverage = computeOverallAverage(student.marks);
  res.json({ marks: student.marks, subjectAverages, overallAverage });
}

module.exports = { getMyStudentDoc, listStudents, addMarks, getStudentMarks, getMyMarks };

