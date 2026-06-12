const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const { checkAndAwardBadges } = require('../utils/badges');

// ===== STATIC ROUTES FIRST (before /:id) =====

const { submitValidators, statusValidators, commentValidators, runValidation } = require('../middleware/validation');

// Submit task
router.post('/submit', protect, submitValidators, runValidation, async (req, res) => {
  try {
    const { type, title, description, priority, dueDate, templateUsed, attachments } = req.body;
    if (!type || !title) return res.status(400).json({ error: 'Type and title required' });

    const job = await Job.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      department: req.user.department || '',
      rollNumber: req.user.rollNumber || '',
      type, title, description,
      priority: priority || 2,
      dueDate: dueDate || null,
      templateUsed: templateUsed || '',
      attachments: attachments || [],
      auditLog: [{ action: 'submitted', by: req.user.name, role: 'student', note: 'Task submitted' }],
      state: 'waiting'
    });

    res.json({ success: true, jobId: job._id, message: 'Task submitted!' });
  } catch (err) {
    console.error('Submit error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get MY tasks (student)
router.get('/my', protect, async (req, res) => {
  try {
    const { page, limit, search, state } = req.query;
    const filter = { userId: req.user._id };
    if (state) filter.state = state;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
      ];
    }

    const query = Job.find(filter).sort({ createdAt: -1 });
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    if (parsedLimit > 0) query.skip((parsedPage - 1) * parsedLimit).limit(parsedLimit);

    const jobs = await query;
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get ALL tasks (admin)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const { archived, page, limit, search, state } = req.query;
    const filter = archived === 'true'
      ? { adminArchived: true }
      : { adminArchived: { $ne: true } };

    if (state) filter.state = state;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const query = Job.find(filter).sort({ createdAt: -1 });
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    if (parsedLimit > 0) query.skip((parsedPage - 1) * parsedLimit).limit(parsedLimit);

    const jobs = await query;
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stats
router.get('/stats', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { adminArchived: { $ne: true } }
      : { userId: req.user._id };
    const [waiting, active, completed, failed, total] = await Promise.all([
      Job.countDocuments({ ...filter, state: 'waiting' }),
      Job.countDocuments({ ...filter, state: 'active' }),
      Job.countDocuments({ ...filter, state: 'completed' }),
      Job.countDocuments({ ...filter, state: 'failed' }),
      Job.countDocuments(filter)
    ]);
    res.json({ waiting, active, completed, failed, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const jobs = await Job.find({
      userId: req.user._id,
      isRead: false,
      $or: [
        { state: 'completed' },
        { state: 'failed' },
        { adminNote: { $ne: '' } }
      ]
    }).sort({ updatedAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notifications read
router.put('/notifications/read', protect, async (req, res) => {
  try {
    await Job.updateMany({ userId: req.user._id }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Badges
router.get('/badges', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.badges || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Weekly report
router.get('/weekly-report', protect, async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [thisWeek, allTime, byType] = await Promise.all([
      Job.find({ userId: req.user._id, createdAt: { $gte: oneWeekAgo } }),
      Job.find({ userId: req.user._id }),
      Job.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: '$type', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$state', 'completed'] }, 1, 0] } } } }
      ])
    ]);
    const ratedJobs = allTime.filter(j => j.rating);
    const avgRating = ratedJobs.length
      ? Math.round((ratedJobs.reduce((acc, j) => acc + j.rating, 0) / ratedJobs.length) * 10) / 10
      : 0;
    res.json({
      thisWeek: {
        total: thisWeek.length,
        completed: thisWeek.filter(j => j.state === 'completed').length,
        pending: thisWeek.filter(j => ['waiting', 'active'].includes(j.state)).length,
        failed: thisWeek.filter(j => j.state === 'failed').length,
      },
      allTime: {
        total: allTime.length,
        completed: allTime.filter(j => j.state === 'completed').length,
        completionRate: allTime.length
          ? Math.round((allTime.filter(j => j.state === 'completed').length / allTime.length) * 100)
          : 0,
        avgRating
      },
      byType
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Students list (admin)
router.get('/students-list', protect, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    const statsPromises = students.map(async (s) => {
      const jobs = await Job.find({ userId: s._id });
      return {
        student: s,
        stats: {
          total: jobs.length,
          waiting: jobs.filter(j => j.state === 'waiting').length,
          active: jobs.filter(j => j.state === 'active').length,
          completed: jobs.filter(j => j.state === 'completed').length,
          failed: jobs.filter(j => j.state === 'failed').length,
          completionRate: jobs.length
            ? Math.round((jobs.filter(j => j.state === 'completed').length / jobs.length) * 100)
            : 0
        }
      };
    });
    const result = await Promise.all(statsPromises);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin analytics
router.get('/admin-analytics', protect, adminOnly, async (req, res) => {
  try {
    const [total, byDept, byType, byState] = await Promise.all([
      Job.countDocuments(),
      Job.aggregate([{ $group: { _id: '$department', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$state', 'completed'] }, 1, 0] } } } }]),
      Job.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Job.aggregate([{ $group: { _id: '$state', count: { $sum: 1 } } }]),
    ]);
    res.json({ total, byDept, byType, byState });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk archive completed (admin)
router.put('/bulk-archive/completed', protect, adminOnly, async (req, res) => {
  try {
    await Job.updateMany(
      { state: 'completed' },
      { adminArchived: true, adminArchivedAt: new Date() }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student tasks (admin)
router.get('/student/:userId', protect, adminOnly, async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    const student = await User.findById(req.params.userId).select('-password');
    res.json({ student, jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== DYNAMIC /:id ROUTES LAST =====

// Add comment
router.post('/:id/comment', protect, commentValidators, runValidation, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment required' });
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Task not found' });
    if (job.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not allowed' });
    }
    job.comments.push({ userId: req.user._id, userName: req.user.name, role: req.user.role, text });
    job.auditLog.push({ action: 'commented', by: req.user.name, role: req.user.role, note: text.substring(0, 50) });
    await job.save();
    try { app.locals.io?.emit('job:updated', { jobId: job._id, state, title: job.title }); } catch (e) {}
    res.json({ success: true, comments: job.comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resubmit task
router.post('/:id/resubmit', protect, async (req, res) => {
  try {
    const original = await Job.findOne({ _id: req.params.id, userId: req.user._id });
    if (!original) return res.status(404).json({ error: 'Task not found' });
    if (original.state !== 'failed') return res.status(400).json({ error: 'Only failed tasks can be resubmitted' });
    const { description, attachments } = req.body;
    const newJob = await Job.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      department: req.user.department || '',
      rollNumber: req.user.rollNumber || '',
      type: original.type,
      title: original.title + ' (Resubmission)',
      description: description || original.description,
      priority: original.priority,
      dueDate: original.dueDate,
      attachments: attachments || original.attachments,
      isResubmission: true,
      resubmissionCount: original.resubmissionCount + 1,
      auditLog: [{ action: 'resubmitted', by: req.user.name, role: 'student', note: 'Resubmitted after failure' }],
      state: 'waiting'
    });
    res.json({ success: true, jobId: newJob._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin update status — FIXED
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { state, adminNote } = req.body;
    const validStates = ['waiting', 'active', 'completed', 'failed'];
    if (!validStates.includes(state)) {
      return res.status(400).json({ error: 'Invalid state' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Task not found' });

    job.state = state;
    if (adminNote) {
      job.adminNote = adminNote;
    }
    job.auditLog.push({
      action: 'status_updated',
      by: req.user.name,
      role: 'admin',
      note: adminNote || `Status changed to ${state}`
    });

    await job.save();
    try { app.locals.io?.emit('job:updated', { jobId: job._id, state: job.state, title: job.title }); } catch (e) {}

    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student mark complete
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.user._id });
    if (!job) return res.status(404).json({ error: 'Task not found' });
    if (job.state === 'completed') return res.status(400).json({ error: 'Already completed' });
    job.state = 'completed';
    job.completedAt = new Date();
    job.auditLog.push({ action: 'completed', by: req.user.name, role: 'student', note: 'Marked as completed by student' });
    await job.save();
    try { app.locals.io?.emit('job:updated', { jobId: job._id, state: job.state, title: job.title }); } catch (e) {}
    const newBadges = await checkAndAwardBadges(req.user._id);
    res.json({ success: true, newBadges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin rate task
router.put('/:id/admin-rate', protect, adminOnly, async (req, res) => {
  try {
    const { rating, ratingNote } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ error: 'Rating must be 1-5' });
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        rating, ratingNote: ratingNote || '',
        $push: { auditLog: { action: 'rated', by: req.user.name, role: 'admin', note: `Rated ${rating}/5` } }
      },
      { new: true }
    );
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student rate task
router.put('/:id/rate', protect, async (req, res) => {
  try {
    const { rating, ratingNote } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be 1-5' });
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, state: 'completed' },
      {
        rating,
        ratingNote: ratingNote || '',
        $push: {
          auditLog: {
            action: 'rated',
            by: req.user.name,
            role: 'student',
            note: `Rated ${rating}/5`
          }
        }
      },
      { new: true }
    );

    if (!job) return res.status(404).json({ error: 'Task not found or not completed' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Archive job (admin soft delete)
router.put('/:id/archive', protect, adminOnly, async (req, res) => {
  try {
    await Job.findByIdAndUpdate(req.params.id, {
      adminArchived: true,
      adminArchivedAt: new Date()
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear completed tasks (admin)
router.delete('/completed', protect, adminOnly, async (req, res) => {
  try {
    const result = await Job.deleteMany({ state: 'completed' });
    res.json({ success: true, deletedCount: result.deletedCount || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get audit log
router.get('/:id/audit', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Not found' });
    res.json(job.auditLog || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student rate task — REMOVED (admin only now)
// Approve task (admin)
router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Task not found' });

    job.approvalStatus = 'approved';
    job.approvedBy = req.user.name;
    job.approvedAt = new Date();
    job.state = 'active';
    job.auditLog.push({
      action: 'approved', by: req.user.name,
      role: 'admin', note: reason || 'Task approved'
    });
    await job.save();
    try { app.locals.io?.emit('job:updated', { jobId: job._id, state: job.state, title: job.title }); } catch (e) {}

    // Send email
    const { sendEmail, approvalEmail } = require('../utils/emailService');
    await sendEmail({
      to: job.userEmail,
      subject: '✅ Your task has been approved!',
      html: approvalEmail(job.userName, job.title, 'approved', reason)
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject task (admin)
router.put('/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Task not found' });

    job.approvalStatus = 'rejected';
    job.rejectionReason = reason || '';
    job.state = 'failed';
    job.auditLog.push({
      action: 'rejected', by: req.user.name,
      role: 'admin', note: reason || 'Task rejected'
    });
    await job.save();

    const { sendEmail, approvalEmail } = require('../utils/emailService');
    await sendEmail({
      to: job.userEmail,
      subject: '❌ Your task has been rejected',
      html: approvalEmail(job.userName, job.title, 'rejected', reason)
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update status with email
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { state, adminNote } = req.body;
    console.log(`🔄 Updating job ${req.params.id} → ${state}`);

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Task not found' });

    job.state = state;
    if (adminNote !== undefined) job.adminNote = adminNote;
    job.completedAt = state === 'completed' ? new Date() : null;
    job.isRead = false;
    if (state === 'active') job.timeStarted = new Date();
    if (state === 'completed' && job.timeStarted) {
      job.timeSpentMinutes = Math.round(
        (new Date() - new Date(job.timeStarted)) / (1000 * 60)
      );
    }
    job.auditLog.push({
      action: `status_changed_to_${state}`,
      by: req.user.name, role: 'admin',
      note: adminNote || `Status changed to ${state}`
    });
    await job.save();

    // Send email notification
    const { sendEmail, taskStatusEmail } = require('../utils/emailService');
    await sendEmail({
      to: job.userEmail,
      subject: `📋 Task Update: ${job.title}`,
      html: taskStatusEmail(job.userName, job.title, state, adminNote)
    });

    if (state === 'completed') await checkAndAwardBadges(job.userId);

    res.json({ success: true, job });
  } catch (err) {
    console.error('Update error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Time tracker — student starts timer
router.put('/:id/start-timer', protect, async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { timeStarted: new Date() },
      { new: true }
    );
    if (!job) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, timeStarted: job.timeStarted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    const leaderboard = await Promise.all(students.map(async (s) => {
      const jobs = await Job.find({ userId: s._id });
      const completed = jobs.filter(j => j.state === 'completed').length;
      const total = jobs.length;
      const avgRating = jobs.filter(j => j.rating).length
        ? Math.round(jobs.filter(j => j.rating).reduce((a, j) => a + j.rating, 0) / jobs.filter(j => j.rating).length * 10) / 10
        : 0;
      return {
        userId: s._id,
        name: s.name,
        department: s.department,
        rollNumber: s.rollNumber,
        completed, total,
        completionRate: total ? Math.round((completed / total) * 100) : 0,
        badges: s.badges?.length || 0,
        avgRating
      };
    }));
    leaderboard.sort((a, b) =>
      b.completed !== a.completed ? b.completed - a.completed : b.completionRate - a.completionRate
    );
    res.json(leaderboard.slice(0, 20));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student of the month
router.get('/student-of-month', protect, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const students = await User.find({ role: 'student' }).select('-password');
    const monthStats = await Promise.all(students.map(async (s) => {
      const jobs = await Job.find({
        userId: s._id,
        state: 'completed',
        completedAt: { $gte: startOfMonth }
      });
      return {
        userId: s._id,
        name: s.name,
        department: s.department,
        rollNumber: s.rollNumber,
        completedThisMonth: jobs.length,
        badges: s.badges?.length || 0
      };
    }));

    monthStats.sort((a, b) => b.completedThisMonth - a.completedThisMonth);
    res.json(monthStats.slice(0, 3));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student feedback on task
router.put('/:id/feedback', protect, async (req, res) => {
  try {
    const { feedback, feedbackRating } = req.body;
    const job = await Job.findOne({ _id: req.params.id, userId: req.user._id });
    if (!job) return res.status(404).json({ error: 'Task not found' });
    if (job.state !== 'completed') return res.status(400).json({ error: 'Can only give feedback on completed tasks' });

    job.studentFeedback = feedback || '';
    job.feedbackRating = feedbackRating || null;
    await job.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Department analytics for students
router.get('/dept-analytics', protect, async (req, res) => {
  try {
    const dept = req.user.department;
    if (!dept) return res.json({ students: 0, avgCompletion: 0, topStudents: [] });

    const students = await User.find({ role: 'student', department: dept }).select('-password');
    const statsArr = await Promise.all(students.map(async (s) => {
      const jobs = await Job.find({ userId: s._id });
      const completed = jobs.filter(j => j.state === 'completed').length;
      return {
        name: s.name,
        completed,
        total: jobs.length,
        rate: jobs.length ? Math.round((completed / jobs.length) * 100) : 0
      };
    }));

    const avgCompletion = statsArr.length
      ? Math.round(statsArr.reduce((a, s) => a + s.rate, 0) / statsArr.length)
      : 0;

    statsArr.sort((a, b) => b.completed - a.completed);

    res.json({
      dept,
      students: students.length,
      avgCompletion,
      topStudents: statsArr.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;