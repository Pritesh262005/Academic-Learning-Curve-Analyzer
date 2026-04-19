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

async function subjectCurveAnalyzer(req, res) {
  const subjectName = req.query.subject;
  const threshold = Number(req.query.threshold || 45);
  if (!subjectName) {
    return res.status(400).json({ message: 'Subject name is required' });
  }

  const students = await Student.find({}).lean();
  let weakList = [];
  const buckets = {
    '0-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-50': 0,
    '51-60': 0, '61-70': 0, '71-80': 0, '81-90': 0, '91-100': 0
  };

  for (const s of students) {
    const subjMarks = (s.marks || []).filter(m => m.subject === subjectName);
    if (!subjMarks.length) continue;
    
    // safePercent from total score in this subject
    const averagePercent = computeOverallAverage(subjMarks);
    
    if (averagePercent < threshold) {
      weakList.push({ userId: s.userId, overall: averagePercent });
    }

    if (averagePercent <= 10) buckets['0-10']++;
    else if (averagePercent <= 20) buckets['11-20']++;
    else if (averagePercent <= 30) buckets['21-30']++;
    else if (averagePercent <= 40) buckets['31-40']++;
    else if (averagePercent <= 50) buckets['41-50']++;
    else if (averagePercent <= 60) buckets['51-60']++;
    else if (averagePercent <= 70) buckets['61-70']++;
    else if (averagePercent <= 80) buckets['71-80']++;
    else if (averagePercent <= 90) buckets['81-90']++;
    else buckets['91-100']++;
  }

  const users = await User.find({ _id: { $in: weakList.map((r) => r.userId) } });
  const byId = new Map(users.map((u) => [u._id.toString(), u.toSafeJSON()]));
  
  const curve = Object.entries(buckets).map(([range, count]) => ({ range, count }));
  
  res.json({
    subject: subjectName,
    threshold,
    curve,
    weakStudents: weakList.map(w => ({ overall: w.overall, user: byId.get(w.userId.toString()) })).sort((a,b) => a.overall - b.overall)
  });
}

module.exports = { classAverage, topperList, weakStudents, mySuggestions, subjectCurveAnalyzer };

