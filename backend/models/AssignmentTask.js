const mongoose = require('mongoose');

const assignmentTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    subject: { type: String, required: true, trim: true },
    dueDate: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: {
      mode: { type: String, enum: ['all_students', 'students'], default: 'all_students' },
      studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AssignmentTask', assignmentTaskSchema);

