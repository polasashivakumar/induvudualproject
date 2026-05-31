const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  targetCount: { type: Number, required: true },
  taskType: { type: String, default: 'all' },
  deadline: { type: Date, default: null },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

goalSchema.index({ userId: 1, completed: 1, createdAt: -1 });

module.exports = mongoose.model('Goal', goalSchema);