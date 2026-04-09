const mongoose = require('mongoose');

const markSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    assessment: { type: String, default: 'Exam', trim: true },
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 1 },
    date: { type: Date, default: Date.now },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'late'], required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    subjects: [{ type: String, trim: true }],
    marks: [markSchema],
    attendance: [attendanceSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);

