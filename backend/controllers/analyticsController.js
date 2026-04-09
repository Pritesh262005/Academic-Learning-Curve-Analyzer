const Student = require('../models/Student');
const User = require('../models/User');
const { computeOverallAverage, computeSubjectAverages, predictNextOverallAverage } = require('../utils/stats');

async function classAverage(req, res) {
  const students = await Student.find({}).lean();
  const allMarks = students.flatMap((s) => s.marks || []);
  const subjectAverages = computeSubjectAverages(allMarks);
  const overallAverage = computeOverallAverage(allMarks);
  res.json({ overallAverage, subjectAverages, countStudents: students.length });
}

async function topperList(req, res) {
  const students = await Student.find({}).lean();
  const ranked = students
    .map((s) => ({ userId: s.userId, overall: computeOverallAverage(s.marks || []) }))
    .sort((a, b) => b.overall - a.overall)
    .slice(0, Number(req.query.limit || 10));

  const users = await User.find({ _id: { $in: ranked.map((r) => r.userId) } });
  const byId = new Map(users.map((u) => [u._id.toString(), u.toSafeJSON()]));
  res.json({
    items: ranked.map((r, idx) => ({ rank: idx + 1, overall: r.overall, user: byId.get(r.userId.toString()) })),
  });
}

async function weakStudents(req, res) {
  const threshold = Number(req.query.threshold || 45);
  const students = await Student.find({}).lean();
  const weak = students
    .map((s) => ({ userId: s.userId, overall: computeOverallAverage(s.marks || []) }))
    .filter((s) => s.overall > 0 && s.overall < threshold)
    .sort((a, b) => a.overall - b.overall)
    .slice(0, Number(req.query.limit || 20));

  const users = await User.find({ _id: { $in: weak.map((r) => r.userId) } });
  const byId = new Map(users.map((u) => [u._id.toString(), u.toSafeJSON()]));
  res.json({
    items: weak.map((w) => ({ overall: w.overall, user: byId.get(w.userId.toString()) })),
    threshold,
  });
}

async function mySuggestions(req, res) {
  const student = await Student.findOne({ userId: req.user._id }).lean();
  if (!student) return res.status(404).json({ message: 'Student record not found' });

  const subjectAverages = computeSubjectAverages(student.marks || []);
  const weakSubjects = subjectAverages.filter((s) => s.averagePercent > 0 && s.averagePercent < 55).slice(0, 3);

  const series = subjectAverages.map((s, idx) => ({ name: `${idx + 1}`, value: s.averagePercent }));
  const predictedOverall = predictNextOverallAverage({ series });
  const currentOverall = (student.marks || []).length ? computeOverallAverage(student.marks || []) : 0;

  res.json({
    weakSubjects,
    currentOverall,
    predictedOverall,
    studyPlan: weakSubjects.map((w) => ({
      subject: w.subject,
      recommendation: `Spend 30–45 mins/day; focus on past papers + recap errors.`,
    })),
  });
}

module.exports = { classAverage, topperList, weakStudents, mySuggestions };

