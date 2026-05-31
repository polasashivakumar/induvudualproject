const User = require('../models/User');
const Job = require('../models/Job');

const checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];
    const jobs = await Job.find({ userId, state: 'completed' });
    const total = jobs.length;
    const existingBadgeIds = (user.badges || []).map(b => b.id);
    const newBadges = [];

    const badgeDefs = [
      { id: 'first_task',   name: 'First Task',      icon: '🎯', condition: total >= 1  },
      { id: 'five_tasks',   name: 'Getting Started',  icon: '🌟', condition: total >= 5  },
      { id: 'ten_tasks',    name: 'Task Master',      icon: '🏆', condition: total >= 10 },
      { id: 'twenty_tasks', name: 'Legend',           icon: '👑', condition: total >= 20 },
      { id: 'speed_demon',  name: 'Speed Demon',      icon: '⚡', condition: jobs.some(j => {
        const diff = new Date(j.completedAt) - new Date(j.createdAt);
        return diff < 60 * 60 * 1000;
      })},
      { id: 'early_bird',   name: 'Early Bird',       icon: '🐦', condition: jobs.some(j => {
        return j.dueDate && new Date(j.completedAt) < new Date(j.dueDate);
      })}
    ];

    for (const badge of badgeDefs) {
      if (badge.condition && !existingBadgeIds.includes(badge.id)) {
        newBadges.push({ id: badge.id, name: badge.name, icon: badge.icon });
      }
    }
    if (newBadges.length > 0) {
      await User.findByIdAndUpdate(userId, { $push: { badges: { $each: newBadges } } });
    }
    return newBadges;
  } catch (err) {
    console.error('Badge error:', err.message);
    return [];
  }
};

module.exports = { checkAndAwardBadges };
