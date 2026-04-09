const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dayjs = require('dayjs');

const { getConfig } = require('../config/env');
const { connectDb } = require('../config/db');
const User = require('../models/User');
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');
const AssignmentTask = require('../models/AssignmentTask');
const Notification = require('../models/Notification');

function parseCsv(name, fallback) {
  const raw = process.env[name] || fallback;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

async function upsertUser({ name, email, password, role, bcryptSaltRounds }) {
  const existing = await User.findOne({ email });
  if (existing) return existing;
  const user = new User({ name, email, password, role });
  user.$locals = { bcryptSaltRounds };
  await user.save();
  return user;
}

async function ensureStudentRecord({ userId, subjects }) {
  await Student.updateOne(
    { userId },
    { $setOnInsert: { userId }, $addToSet: { subjects: { $each: subjects } } },
    { upsert: true }
  );
}

async function clearDemoData({ studentIds, facultyIds }) {
  await Promise.all([
    Student.updateMany({ userId: { $in: studentIds } }, { $set: { marks: [], attendance: [] } }),
    Assignment.deleteMany({ studentId: { $in: studentIds } }),
    AssignmentTask.deleteMany({ createdBy: { $in: facultyIds } }),
    Notification.deleteMany({ userId: { $in: [...studentIds, ...facultyIds] } }),
  ]);
}

async function seedMarks({ studentId, facultyId, subjects, rng }) {
  const assessments = ['Internal-1', 'Internal-2', 'Semester'];
  const maxScore = 100;
  const baseSkill = 45 + rng() * 40; // 45..85
  const now = dayjs();

  const rows = [];
  for (const subject of subjects) {
    const subjectBias = (rng() - 0.5) * 18; // -9..9
    for (let i = 0; i < assessments.length; i += 1) {
      const trend = i * (rng() * 6); // slight improvement
      const percent = clamp(baseSkill + subjectBias + trend + (rng() - 0.5) * 10, 18, 98);
      const score = Math.round((percent / 100) * maxScore);
      rows.push({
        subject,
        assessment: assessments[i],
        score,
        maxScore,
        date: now.subtract((assessments.length - i) * 14, 'day').toDate(),
        enteredBy: facultyId,
      });
    }
  }

  await Student.updateOne({ userId: studentId }, { $push: { marks: { $each: rows } } });
}

async function seedAttendance({ studentId, facultyId, rng }) {
  const start = dayjs().subtract(30, 'day');
  const rows = [];
  for (let i = 0; i < 30; i += 1) {
    const d = start.add(i, 'day');
    const roll = rng();
    const status = roll < 0.82 ? 'present' : roll < 0.9 ? 'late' : 'absent';
    rows.push({ date: d.startOf('day').toDate(), status, markedBy: facultyId });
  }
  await Student.updateOne({ userId: studentId }, { $push: { attendance: { $each: rows } } });
}

async function seedAssignments({ studentId, facultyId, uploadsDirAbs, rng, taskIds }) {
  const created = [];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'DBMS', 'OS', 'Computer Networks'];
  for (let i = 1; i <= 2; i += 1) {
    const subject = subjects[Math.floor(rng() * subjects.length)];
    const title = `Assignment ${i} - ${subject}`;
    const filename = `demo_${studentId.toString().slice(-6)}_${Date.now()}_${i}.txt`;
    const filePath = path.join(uploadsDirAbs, filename);
    fs.writeFileSync(filePath, `Demo submission for ${title}\nStudent: ${studentId}\n`, 'utf8');

    const shouldGrade = rng() > 0.35;
    const marks = shouldGrade ? Math.round(55 + rng() * 40) : null;
    const status = shouldGrade ? 'graded' : 'submitted';
    const feedback = shouldGrade ? (marks >= 80 ? 'Excellent work.' : marks >= 65 ? 'Good effort.' : 'Needs improvement.') : '';

    const assignment = await Assignment.create({
      taskId: taskIds?.length && rng() > 0.4 ? taskIds[Math.floor(rng() * taskIds.length)] : null,
      title,
      description: 'Auto-generated demo assignment for project showcase.',
      subject,
      studentId,
      file: {
        originalName: filename,
        filename,
        path: filePath,
        mimeType: 'text/plain',
        size: fs.statSync(filePath).size,
      },
      marks,
      status,
      feedback,
      gradedBy: shouldGrade ? facultyId : null,
    });
    created.push(assignment);
  }
  return created;
}

async function seedNotifications({ studentId, facultyId }) {
  await Notification.create([
    {
      userId: studentId,
      title: 'Welcome to Academic LCA',
      body: 'Your dashboard is ready. Check Performance, Attendance, and Assignments.',
      type: 'info',
    },
    {
      userId: facultyId,
      title: 'Demo Data Ready',
      body: 'Students, marks, attendance, and assignments have been seeded.',
      type: 'success',
    },
  ]);
}

async function run() {
  const config = getConfig();
  await connectDb(config.mongoUri);

  const seed = Number(process.env.SEED_DEMO_SEED || 42);
  const rng = mulberry32(seed);
  const subjects = parseCsv('SEED_DEMO_SUBJECTS', 'Mathematics,Physics,Chemistry,DBMS,OS,Computer Networks');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
  const adminName = process.env.SEED_ADMIN_NAME || 'Admin';

  const facultyPassword = process.env.SEED_FACULTY_PASSWORD || 'Faculty@12345';
  const studentPassword = process.env.SEED_STUDENT_PASSWORD || 'Student@12345';
  const domain = process.env.SEED_DEMO_DOMAIN || 'demo.edu';

  const uploadsDirAbs = path.join(__dirname, '..', config.uploadsDir);
  if (!fs.existsSync(uploadsDirAbs)) fs.mkdirSync(uploadsDirAbs, { recursive: true });

  const admin = await upsertUser({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    bcryptSaltRounds: config.bcryptSaltRounds,
  });

  const faculty1 = await upsertUser({
    name: 'Faculty 1',
    email: `faculty1@${domain}`,
    password: facultyPassword,
    role: 'faculty',
    bcryptSaltRounds: config.bcryptSaltRounds,
  });
  const faculty2 = await upsertUser({
    name: 'Faculty 2',
    email: `faculty2@${domain}`,
    password: facultyPassword,
    role: 'faculty',
    bcryptSaltRounds: config.bcryptSaltRounds,
  });

  const studentCount = Number(process.env.SEED_STUDENT_COUNT || 5);
  const students = [];
  for (let i = 1; i <= studentCount; i += 1) {
    const u = await upsertUser({
      name: `Student ${i}`,
      email: `student${i}@${domain}`,
      password: studentPassword,
      role: 'student',
      bcryptSaltRounds: config.bcryptSaltRounds,
    });
    await ensureStudentRecord({ userId: u._id, subjects });
    students.push(u);
  }

  const studentIds = students.map((s) => s._id);
  await clearDemoData({ studentIds, facultyIds: [faculty1._id, faculty2._id] });

  const tasks = await AssignmentTask.insertMany([
    {
      title: 'Lab Report 1',
      description: 'Submit the first lab report in PDF or DOC format.',
      subject: 'DBMS',
      dueDate: dayjs().add(5, 'day').toDate(),
      createdBy: faculty1._id,
      assignedTo: { mode: 'all_students', studentIds: [] },
      status: 'open',
    },
    {
      title: 'Problem Sheet A',
      description: 'Solve and submit the selected questions.',
      subject: 'Mathematics',
      dueDate: dayjs().add(7, 'day').toDate(),
      createdBy: faculty2._id,
      assignedTo: { mode: 'all_students', studentIds: [] },
      status: 'open',
    },
    {
      title: 'Mini Project Proposal',
      description: 'Write a 1-page proposal: topic, objective, and tech stack.',
      subject: 'Computer Networks',
      dueDate: dayjs().add(10, 'day').toDate(),
      createdBy: faculty1._id,
      assignedTo: { mode: 'all_students', studentIds: [] },
      status: 'open',
    },
  ]);

  await Notification.insertMany(
    studentIds.map((userId) => ({
      userId,
      title: 'New assignment tasks available',
      body: 'Open Assignments page to view posted tasks.',
      type: 'info',
    }))
  );

  for (const s of students) {
    const facultyId = rng() > 0.5 ? faculty1._id : faculty2._id;
    await seedMarks({ studentId: s._id, facultyId, subjects, rng });
    await seedAttendance({ studentId: s._id, facultyId, rng });
    await seedAssignments({ studentId: s._id, facultyId, uploadsDirAbs, rng, taskIds: tasks.map((t) => t._id) });
    await seedNotifications({ studentId: s._id, facultyId });
  }

  // eslint-disable-next-line no-console
  console.log('Seed demo complete.');
  // eslint-disable-next-line no-console
  console.log('Admin:', adminEmail, '/', adminPassword);
  // eslint-disable-next-line no-console
  console.log('Faculty:', `faculty1@${domain}`, '/', facultyPassword, 'and', `faculty2@${domain}`, '/', facultyPassword);
  // eslint-disable-next-line no-console
  console.log('Students:', `student1..student${studentCount}@${domain}`, '/', studentPassword);

  await mongoose.disconnect();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
