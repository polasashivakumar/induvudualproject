const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  role: { type: String, default: 'student' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const attachmentSchema = new mongoose.Schema({
  name: String,
  filename: String,
  url: String,
  size: Number,
  type: { type: String, default: 'file' }, // file or video
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
  priority: { type: Number, default: 2 },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  urgency: {
    type: String,
    enum: ['urgent', 'normal', 'low'],
    default: 'normal'
  },
  state: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'failed'],
    default: 'waiting'
  },
  // Approval
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: { type: String, default: '' },
  approvedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: '' },
  // Feedback from student
  studentFeedback: { type: String, default: '' },
  feedbackRating: { type: Number, default: null, min: 1, max: 5 },
  // Goals
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null },
  // Time tracker
  timeStarted: { type: Date, default: null },
  timeCompleted: { type: Date, default: null },
  timeSpentMinutes: { type: Number, default: 0 },
  // Other
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

jobSchema.index({ userId: 1, state: 1, createdAt: -1 });
jobSchema.index({ userId: 1, completedAt: -1 });
jobSchema.index({ department: 1, state: 1 });

module.exports = mongoose.model('Job', jobSchema);