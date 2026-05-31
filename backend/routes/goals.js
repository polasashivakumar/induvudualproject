const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

// Get my goals
router.get('/', protect, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Calculate progress for each goal
    const goalsWithProgress = await Promise.all(goals.map(async (goal) => {
      const filter = { userId: req.user._id, state: 'completed' };
      if (goal.taskType !== 'all') filter.type = goal.taskType;
      if (goal.createdAt) filter.completedAt = { $gte: goal.createdAt };

      const count = await Job.countDocuments(filter);
      const progress = Math.min(Math.round((count / goal.targetCount) * 100), 100);

      // Auto complete goal
      if (progress >= 100 && !goal.completed) {
        await Goal.findByIdAndUpdate(goal._id, {
          completed: true, completedAt: new Date()
        });
      }

      return { ...goal.toObject(), currentCount: count, progress }
    }));

    res.json(goalsWithProgress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create goal
router.post('/', protect, async (req, res) => {
  try {
    const { title, targetCount, taskType, deadline } = req.body;
    if (!title || !targetCount) return res.status(400).json({ error: 'Title and target required' });

    const goal = await Goal.create({
      userId: req.user._id,
      title, targetCount,
      taskType: taskType || 'all',
      deadline: deadline || null
    });
    res.json({ success: true, goal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete goal
router.delete('/:id', protect, async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;