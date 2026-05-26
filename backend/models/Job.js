const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  role: { type: String, default: 'student' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const attachmentSchema = new mongoose.Schema({
  name: String, filename: String,
  url: String, size: Number,
  uploadedAt: { type: Date, default: Date.now }
});

const auditSchema = new mongoose.Schema({
  action: String, by: String,
  role: String, note: String,
  at: { type: Date, default: Date.now }
});

const jobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String },
  userEmail: { type: String },
  department: { type: String, default: '' },
  rollNumber: { type: String, default: '' },
  type: {
    type: String,
    enum: ['assignment', 'lab_report', 'project_review', 'library_request', 'print_request'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: Number, default: 2 },
  state: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'failed'],
    default: 'waiting'
  },
  // Approval workflow
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: { type: String, default: '' },
  approvedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: '' },
  // Time tracker
  timeStarted: { type: Date, default: null },
  timeCompleted: { type: Date, default: null },
  timeSpentMinutes: { type: Number, default: 0 },
  // Other fields
  attempts: { type: Number, default: 0 },
  adminNote: { type: String, default: '' },
  comments: [commentSchema],
  attachments: [attachmentSchema],
  auditLog: [auditSchema],
  rating: { type: Number, default: null, min: 1, max: 5 },
  ratingNote: { type: String, default: '' },
  isResubmission: { type: Boolean, default: false },
  resubmissionCount: { type: Number, default: 0 },
  templateUsed: { type: String, default: '' },
  result: { type: Object, default: null },
  failedReason: { type: String, default: null },
  completedAt: { type: Date, default: null },
  dueDate: { type: Date, default: null },
  isRead: { type: Boolean, default: false },
  adminArchived: { type: Boolean, default: false },
  adminArchivedAt: { type: Date, default: null },
  emailNotified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);